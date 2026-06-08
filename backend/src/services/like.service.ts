import { AppDataSource } from "../config/database";
import { Comment } from "../entities/Comment";
import { Like } from "../entities/Like";
import { Post } from "../entities/Post";
import { LikeTargetType } from "../entities/enums";
import { commentService } from "./comment.service";
import { postService } from "./post.service";
import { invalidateFeedCaches } from "../utils/cache";
import { AppError } from "../utils/AppError";
import { decodeFeedCursor, encodeFeedCursor } from "../utils/cursor";
import {
  LikeStateDto,
  LikerDto,
  toLikerDto,
} from "../utils/likeMapper";

export interface LikersResult {
  users: LikerDto[];
  nextCursor: string | null;
}

export class LikeService {
  private readonly likeRepository = AppDataSource.getRepository(Like);
  private readonly postRepository = AppDataSource.getRepository(Post);
  private readonly commentRepository = AppDataSource.getRepository(Comment);

  async like(
    userId: string,
    targetId: string,
    targetType: LikeTargetType
  ): Promise<LikeStateDto> {
    await this.assertTargetViewable(targetId, targetType, userId);

    const existing = await this.likeRepository.findOne({
      where: { userId, targetId, targetType },
    });

    if (existing) {
      return this.getLikeState(targetId, targetType, userId);
    }

    await AppDataSource.transaction(async (manager) => {
      const likeRepo = manager.getRepository(Like);

      const like = likeRepo.create({ userId, targetId, targetType });
      await likeRepo.save(like);

      if (targetType === LikeTargetType.POST) {
        await manager.getRepository(Post).increment({ id: targetId }, "likeCount", 1);
        invalidateFeedCaches();
      } else {
        await manager
          .getRepository(Comment)
          .increment({ id: targetId }, "likeCount", 1);
      }
    });

    return this.getLikeState(targetId, targetType, userId);
  }

  async unlike(
    userId: string,
    targetId: string,
    targetType: LikeTargetType
  ): Promise<LikeStateDto> {
    await this.assertTargetViewable(targetId, targetType, userId);

    const existing = await this.likeRepository.findOne({
      where: { userId, targetId, targetType },
    });

    if (!existing) {
      return this.getLikeState(targetId, targetType, userId);
    }

    await AppDataSource.transaction(async (manager) => {
      const likeRepo = manager.getRepository(Like);
      await likeRepo.delete({ id: existing.id });

      if (targetType === LikeTargetType.POST) {
        const postRepo = manager.getRepository(Post);
        const post = await postRepo.findOne({
          where: { id: targetId },
          select: { likeCount: true },
        });
        if (post && post.likeCount > 0) {
          await postRepo.decrement({ id: targetId }, "likeCount", 1);
        }
        invalidateFeedCaches();
      } else {
        const commentRepo = manager.getRepository(Comment);
        const comment = await commentRepo.findOne({
          where: { id: targetId },
          select: { likeCount: true },
        });
        if (comment && comment.likeCount > 0) {
          await commentRepo.decrement({ id: targetId }, "likeCount", 1);
        }
      }
    });

    return this.getLikeState(targetId, targetType, userId);
  }

  async listLikers(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<LikersResult> {
    await this.assertTargetViewable(targetId, targetType, userId);

    const query = this.likeRepository
      .createQueryBuilder("like")
      .innerJoinAndSelect("like.user", "user")
      .where("like.targetId = :targetId", { targetId })
      .andWhere("like.targetType = :targetType", { targetType });

    if (cursor) {
      const decoded = decodeFeedCursor(cursor);
      query.andWhere(
        "(like.createdAt < :cursorDate OR (like.createdAt = :cursorDate AND like.id < :cursorId))",
        {
          cursorDate: decoded.createdAt,
          cursorId: decoded.id,
        }
      );
    }

    const rows = await query
      .orderBy("like.createdAt", "DESC")
      .addOrderBy("like.id", "DESC")
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const users = pageRows.map((like) => {
      if (!like.user) {
        throw new AppError(500, "Like user relation missing");
      }
      return toLikerDto(like.user);
    });

    const nextCursor =
      hasMore && pageRows.length > 0
        ? encodeFeedCursor({
            createdAt: pageRows[pageRows.length - 1].createdAt,
            id: pageRows[pageRows.length - 1].id,
          })
        : null;

    return { users, nextCursor };
  }

  private async assertTargetViewable(
    targetId: string,
    targetType: LikeTargetType,
    userId: string
  ): Promise<void> {
    if (targetType === LikeTargetType.POST) {
      const post = await postService.getPostIfViewable(targetId, userId);
      if (!post) {
        throw new AppError(404, "Post not found");
      }
      return;
    }

    await commentService.getCommentWithViewCheck(targetId, userId);
  }

  private async getLikeState(
    targetId: string,
    targetType: LikeTargetType,
    userId: string
  ): Promise<LikeStateDto> {
    const isLikedByMe = Boolean(
      await this.likeRepository.findOne({
        where: { userId, targetId, targetType },
        select: { id: true },
      })
    );

    let likeCount = 0;

    if (targetType === LikeTargetType.POST) {
      const post = await this.postRepository.findOne({
        where: { id: targetId },
        select: { likeCount: true },
      });
      likeCount = post?.likeCount ?? 0;
    } else {
      const comment = await this.commentRepository.findOne({
        where: { id: targetId },
        select: { likeCount: true },
      });
      likeCount = comment?.likeCount ?? 0;
    }

    return {
      targetId,
      targetType,
      likeCount,
      isLikedByMe,
    };
  }
}

export const likeService = new LikeService();
