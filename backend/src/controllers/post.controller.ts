import { NextFunction, Request, Response } from "express";
import { PostVisibility } from "../entities/enums";
import { postService } from "../services/post.service";
import { AppError } from "../utils/AppError";
import {
  CreatePostInput,
  CreatePostMultipartInput,
  ListPostsQuery,
} from "../validators/post.validator";

export class PostController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      let content: string | null = null;
      let visibility = PostVisibility.PUBLIC;
      let imageUrl: string | null = null;

      if (req.file) {
        const input = req.body as CreatePostMultipartInput;
        content = input.content ?? null;
        visibility = input.visibility ?? PostVisibility.PUBLIC;
        imageUrl = `/uploads/${req.file.filename}`;
      } else {
        const input = req.body as CreatePostInput;
        content = input.content ?? null;
        visibility = input.visibility ?? PostVisibility.PUBLIC;
      }

      if (!content && !imageUrl) {
        throw new AppError(400, "Post must include text or an image");
      }

      const post = await postService.create({
        authorId: req.user.id,
        content,
        imageUrl,
        visibility,
      });

      res.status(201).json({ post });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const query = req.query as unknown as ListPostsQuery;
      const result = await postService.listFeed(
        req.user.id,
        query.limit,
        query.cursor
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const post = await postService.getById(req.params.id, req.user.id);
      res.status(200).json({ post });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      await postService.delete(req.params.id, req.user.id);
      res.status(200).json({ message: "Post deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
