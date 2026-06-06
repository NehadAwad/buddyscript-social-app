import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Like } from "../entities/Like";
import { Post } from "../entities/Post";
import { LikeTargetType, PostVisibility } from "../entities/enums";
import { AppError } from "../utils/AppError";
import { decodeFeedCursor, encodeFeedCursor } from "../utils/cursor";
import { FeedPostDto, toFeedPost } from "../utils/postMapper";

export interface CreatePostData {
  authorId: string;
  content: string | null;
  imageUrl: string | null;
  visibility: PostVisibility;
}

export interface FeedResult {
  posts: FeedPostDto[];
  nextCursor: string | null;
}

export class PostService {
  private readonly postRepository = AppDataSource.getRepository(Post);
  private readonly likeRepository = AppDataSource.getRepository(Like);

  async create(data: CreatePostData): Promise<FeedPostDto> {
    if (!data.content && !data.imageUrl) {
      throw new AppError(400, "Post must include text or an image");
    }

    const post = this.postRepository.create({
      authorId: data.authorId,
      content: data.content,
      imageUrl: data.imageUrl,
      visibility: data.visibility,
      likeCount: 0,
      commentCount: 0,
    });

    await this.postRepository.save(post);

    const saved = await this.postRepository.findOne({
      where: { id: post.id },
      relations: { author: true },
    });

    if (!saved) {
      throw new AppError(500, "Failed to create post");
    }

    return toFeedPost(saved, false);
  }

  async listFeed(userId: string, limit: number, cursor?: string): Promise<FeedResult> {
    const query = this.postRepository
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.author", "author")
      .where("(post.visibility = :public OR post.authorId = :userId)", {
        public: PostVisibility.PUBLIC,
        userId,
      });

    if (cursor) {
      const decoded = decodeFeedCursor(cursor);
      query.andWhere(
        "(post.createdAt < :cursorDate OR (post.createdAt = :cursorDate AND post.id < :cursorId))",
        {
          cursorDate: decoded.createdAt,
          cursorId: decoded.id,
        }
      );
    }

    const rows = await query
      .orderBy("post.createdAt", "DESC")
      .addOrderBy("post.id", "DESC")
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const likedIds = await this.getLikedPostIds(
      userId,
      pageRows.map((post) => post.id)
    );

    const posts = pageRows.map((post) =>
      toFeedPost(post, likedIds.has(post.id))
    );

    const nextCursor =
      hasMore && pageRows.length > 0
        ? encodeFeedCursor({
            createdAt: pageRows[pageRows.length - 1].createdAt,
            id: pageRows[pageRows.length - 1].id,
          })
        : null;

    return { posts, nextCursor };
  }

  async getById(postId: string, userId: string): Promise<FeedPostDto> {
    const post = await this.getPostIfViewable(postId, userId);
    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const likedIds = await this.getLikedPostIds(userId, [post.id]);
    return toFeedPost(post, likedIds.has(post.id));
  }

  async delete(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.authorId !== userId) {
      throw new AppError(403, "You can only delete your own posts");
    }

    await this.postRepository.delete({ id: postId });
  }

  async getPostIfViewable(postId: string, userId: string): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      return null;
    }

    if (post.visibility === PostVisibility.PRIVATE && post.authorId !== userId) {
      return null;
    }

    return post;
  }

  private async getLikedPostIds(
    userId: string,
    postIds: string[]
  ): Promise<Set<string>> {
    if (postIds.length === 0) {
      return new Set();
    }

    const likes = await this.likeRepository.find({
      where: {
        userId,
        targetType: LikeTargetType.POST,
        targetId: In(postIds),
      },
      select: {
        targetId: true,
      },
    });

    return new Set(likes.map((like) => like.targetId));
  }
}

export const postService = new PostService();
