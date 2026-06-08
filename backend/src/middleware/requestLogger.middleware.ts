import { NextFunction, Request, Response } from "express";
import { logRequest } from "../utils/logger";

const SKIP_PATHS = new Set(["/api/health"]);

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    if (SKIP_PATHS.has(req.path)) {
      return;
    }

    logRequest({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.id,
    });
  });

  next();
}
