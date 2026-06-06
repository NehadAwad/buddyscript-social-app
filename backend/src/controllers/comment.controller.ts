import { NextFunction, Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { AppError } from "../utils/AppError";
import {
  CreateCommentInput,
  ListCommentsQuery,
} from "../validators/comment.validator";

export class CommentController {
  async createOnPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const input = req.body as CreateCommentInput;
      const comment = await commentService.create(
        {
          postId: req.params.id,
          authorId: req.user.id,
          content: input.content,
          parentId: input.parentId,
        },
        req.user.id
      );

      res.status(201).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  async listForPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const query = req.query as unknown as ListCommentsQuery;
      const result = await commentService.listForPost(
        req.params.id,
        req.user.id,
        query.limit,
        query.cursor
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listReplies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const query = req.query as unknown as ListCommentsQuery;
      const result = await commentService.listReplies(
        req.params.id,
        req.user.id,
        query.limit,
        query.cursor
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      await commentService.delete(req.params.id, req.user.id);
      res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
