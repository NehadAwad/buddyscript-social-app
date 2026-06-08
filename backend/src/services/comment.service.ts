import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Comment } from "../entities/Comment";
import { Like } from "../entities/Like";
import { Post } from "../entities/Post";
import { LikeTargetType } from "../entities/enums";
import { postService } from "./post.service";
import { invalidateFeedCaches } from "../utils/cache";
import { AppError } from "../utils/AppError";
import { CommentDto, toCommentDto } from "../utils/commentMapper";
import { decodeFeedCursor, encodeFeedCursor } from "../utils/cursor";

export interface CommentListResult {
  comments: CommentDto[];
  nextCursor: string | null;
}

export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}

const MAX_REPLIES_PER_COMMENT = 20;

export class CommentService {
  private readonly commentRepository = AppDataSource.getRepository(Comment);
  private readonly likeRepository = AppDataSource.getRepository(Like);

  async create(data: CreateCommentData, userId: string): Promise<CommentDto> {
    const post = await postService.getPostIfViewable(data.postId, userId);
    if (!post) {
      throw new AppError(404, "Post not found");
    }

    let parent: Comment | null = null;

    if (data.parentId) {
      parent = await this.commentRepository.findOne({
        where: { id: data.parentId, postId: data.postId },
      });

      if (!parent) {
        throw new AppError(404, "Parent comment not found");
      }

      if (parent.parentId !== null) {
        throw new AppError(400, "Replies can only be added to top-level comments");
      }
    }

    const saved = await AppDataSource.transaction(async (manager) => {
      const commentRepo = manager.getRepository(Comment);
      const postRepo = manager.getRepository(Post);

      const comment = commentRepo.create({
        postId: data.postId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId ?? null,
        likeCount: 0,
        replyCount: 0,
      });

      await commentRepo.save(comment);

      if (parent) {
        await commentRepo.increment({ id: parent.id }, "replyCount", 1);
      } else {
        await postRepo.increment({ id: data.postId }, "commentCount", 1);
      }

      const withAuthor = await commentRepo.findOne({
        where: { id: comment.id },
        relations: { author: true },
      });

      if (!withAuthor) {
        throw new AppError(500, "Failed to create comment");
      }

      return withAuthor;
    });

    if (!data.parentId) {
      invalidateFeedCaches();
    }

    return toCommentDto(saved, false);
  }

  async listForPost(
    postId: string,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<CommentListResult> {
    const post = await postService.getPostIfViewable(postId, userId);
    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const query = this.commentRepository
      .createQueryBuilder("comment")
      .innerJoinAndSelect("comment.author", "author")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.parentId IS NULL");

    if (cursor) {
      const decoded = decodeFeedCursor(cursor);
      query.andWhere(
        "(comment.createdAt > :cursorDate OR (comment.createdAt = :cursorDate AND comment.id > :cursorId))",
        {
          cursorDate: decoded.createdAt,
          cursorId: decoded.id,
        }
      );
    }

    const topLevel = await query
      .orderBy("comment.createdAt", "ASC")
      .addOrderBy("comment.id", "ASC")
      .take(limit + 1)
      .getMany();

    const hasMore = topLevel.length > limit;
    const pageRows = hasMore ? topLevel.slice(0, limit) : topLevel;
    const parentIds = pageRows.map((comment) => comment.id);

    const repliesByParent = await this.loadRepliesForParents(parentIds, userId);
    const likedIds = await this.getLikedCommentIds(userId, [
      ...parentIds,
      ...Object.values(repliesByParent).flat().map((reply) => reply.id),
    ]);

    const comments = pageRows.map((comment) =>
      toCommentDto(
        comment,
        likedIds.has(comment.id),
        (repliesByParent[comment.id] ?? []).map((reply) =>
          toCommentDto(reply, likedIds.has(reply.id))
        )
      )
    );

    const nextCursor =
      hasMore && pageRows.length > 0
        ? encodeFeedCursor({
            createdAt: pageRows[pageRows.length - 1].createdAt,
            id: pageRows[pageRows.length - 1].id,
          })
        : null;

    return { comments, nextCursor };
  }

  async listReplies(
    commentId: string,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<CommentListResult> {
    const parent = await this.getCommentWithViewCheck(commentId, userId);

    if (parent.parentId !== null) {
      throw new AppError(400, "Replies can only be listed for top-level comments");
    }

    const query = this.commentRepository
      .createQueryBuilder("comment")
      .innerJoinAndSelect("comment.author", "author")
      .where("comment.parentId = :parentId", { parentId: commentId });

    if (cursor) {
      const decoded = decodeFeedCursor(cursor);
      query.andWhere(
        "(comment.createdAt > :cursorDate OR (comment.createdAt = :cursorDate AND comment.id > :cursorId))",
        {
          cursorDate: decoded.createdAt,
          cursorId: decoded.id,
        }
      );
    }

    const rows = await query
      .orderBy("comment.createdAt", "ASC")
      .addOrderBy("comment.id", "ASC")
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const likedIds = await this.getLikedCommentIds(
      userId,
      pageRows.map((comment) => comment.id)
    );

    const comments = pageRows.map((comment) =>
      toCommentDto(comment, likedIds.has(comment.id))
    );

    const nextCursor =
      hasMore && pageRows.length > 0
        ? encodeFeedCursor({
            createdAt: pageRows[pageRows.length - 1].createdAt,
            id: pageRows[pageRows.length - 1].id,
          })
        : null;

    return { comments, nextCursor };
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new AppError(403, "You can only delete your own comments");
    }

    const post = await postService.getPostIfViewable(comment.postId, userId);
    if (!post) {
      throw new AppError(404, "Post not found");
    }

    await AppDataSource.transaction(async (manager) => {
      const commentRepo = manager.getRepository(Comment);
      const postRepo = manager.getRepository(Post);

      if (comment.parentId) {
        await commentRepo.decrement({ id: comment.parentId }, "replyCount", 1);
      } else {
        await postRepo.decrement({ id: comment.postId }, "commentCount", 1);
      }

      await commentRepo.delete({ id: commentId });
    });

    if (!comment.parentId) {
      invalidateFeedCaches();
    }
  }

  async getCommentWithViewCheck(
    commentId: string,
    userId: string
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { author: true },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    const post = await postService.getPostIfViewable(comment.postId, userId);
    if (!post) {
      throw new AppError(404, "Post not found");
    }

    return comment;
  }

  private async loadRepliesForParents(
    parentIds: string[],
    _userId: string
  ): Promise<Record<string, Comment[]>> {
    if (parentIds.length === 0) {
      return {};
    }

    const replies = await this.commentRepository.find({
      where: { parentId: In(parentIds) },
      relations: { author: true },
      order: { createdAt: "ASC", id: "ASC" },
    });

    const grouped: Record<string, Comment[]> = {};

    for (const reply of replies) {
      if (!reply.parentId) {
        continue;
      }

      if (!grouped[reply.parentId]) {
        grouped[reply.parentId] = [];
      }

      if (grouped[reply.parentId].length < MAX_REPLIES_PER_COMMENT) {
        grouped[reply.parentId].push(reply);
      }
    }

    return grouped;
  }

  private async getLikedCommentIds(
    userId: string,
    commentIds: string[]
  ): Promise<Set<string>> {
    if (commentIds.length === 0) {
      return new Set();
    }

    const likes = await this.likeRepository.find({
      where: {
        userId,
        targetType: LikeTargetType.COMMENT,
        targetId: In(commentIds),
      },
      select: { targetId: true },
    });

    return new Set(likes.map((like) => like.targetId));
  }
}

export const commentService = new CommentService();
