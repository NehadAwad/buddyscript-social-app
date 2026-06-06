import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Image must be 5MB or smaller" });
      return;
    }

    res.status(400).json({ message: error.message });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  res.status(500).json({ message: "Internal server error" });
}
