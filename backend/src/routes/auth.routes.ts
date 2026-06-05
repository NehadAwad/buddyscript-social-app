import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.use(authRateLimiter);

router.post(
  "/register",
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.get("/me", authenticate, authController.me.bind(authController));

export default router;
