import { Router, Request, Response, NextFunction } from "express";
import { postController } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware";
import { postRateLimiter } from "../middleware/rateLimiter";
import { optionalPostImageUpload } from "../middleware/upload.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";
import {
  createPostMultipartSchema,
  createPostSchema,
  listPostsQuerySchema,
  postIdParamSchema,
} from "../validators/post.validator";

const router = Router();

router.use(authenticate);
router.use(postRateLimiter);

function validateCreatePost(req: Request, res: Response, next: NextFunction): void {
  const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");

  if (isMultipart || req.file) {
    validateBody(createPostMultipartSchema)(req, res, next);
    return;
  }

  validateBody(createPostSchema)(req, res, next);
}

router.post(
  "/",
  optionalPostImageUpload,
  validateCreatePost,
  postController.create.bind(postController)
);

router.get("/", validateQuery(listPostsQuerySchema), postController.list.bind(postController));

router.get(
  "/:id",
  validateParams(postIdParamSchema),
  postController.getById.bind(postController)
);

router.delete(
  "/:id",
  validateParams(postIdParamSchema),
  postController.remove.bind(postController)
);

export default router;
