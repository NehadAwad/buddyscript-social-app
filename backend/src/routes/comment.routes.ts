import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { postRateLimiter } from "../middleware/rateLimiter";
import {
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";
import {
  commentIdParamSchema,
  listCommentsQuerySchema,
} from "../validators/comment.validator";

const router = Router();

router.use(authenticate);
router.use(postRateLimiter);

router.get(
  "/:id/replies",
  validateParams(commentIdParamSchema),
  validateQuery(listCommentsQuerySchema),
  commentController.listReplies.bind(commentController)
);

router.delete(
  "/:id",
  validateParams(commentIdParamSchema),
  commentController.remove.bind(commentController)
);

export default router;
