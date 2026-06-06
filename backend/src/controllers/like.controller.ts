import { NextFunction, Request, Response } from "express";
import { likeService } from "../services/like.service";
import { AppError } from "../utils/AppError";
import {
  LikeBodyInput,
  LikersQuery,
  UnlikeQueryInput,
} from "../validators/like.validator";

export class LikeController {
  async like(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const input = req.body as LikeBodyInput;
      const result = await likeService.like(
        req.user.id,
        input.targetId,
        input.targetType
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unlike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const query = req.query as unknown as UnlikeQueryInput;
      const result = await likeService.unlike(
        req.user.id,
        query.targetId,
        query.targetType
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listLikers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const query = req.query as unknown as LikersQuery;
      const result = await likeService.listLikers(
        req.params.targetId,
        query.type,
        req.user.id,
        query.limit,
        query.cursor
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const likeController = new LikeController();
