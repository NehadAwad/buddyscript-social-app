import { Router } from "express";
import { likeController } from "../controllers/like.controller";
import { authenticate } from "../middleware/auth.middleware";
import { likeRateLimiter } from "../middleware/rateLimiter";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";
import {
  likeBodySchema,
  likeTargetIdParamSchema,
  likersQuerySchema,
  unlikeQuerySchema,
} from "../validators/like.validator";

const router = Router();

router.use(authenticate);
router.use(likeRateLimiter);

router.post("/", validateBody(likeBodySchema), likeController.like.bind(likeController));

router.delete(
  "/",
  validateQuery(unlikeQuerySchema),
  likeController.unlike.bind(likeController)
);

router.get(
  "/:targetId/users",
  validateParams(likeTargetIdParamSchema),
  validateQuery(likersQuerySchema),
  likeController.listLikers.bind(likeController)
);

export default router;
