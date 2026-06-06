import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new AppError(400, "Only JPEG, PNG, and WebP images are allowed"));
    return;
  }

  callback(null, true);
}

export const uploadPostImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export function optionalPostImageUpload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    uploadPostImage.single("image")(req, res, next);
    return;
  }

  next();
}

export { uploadsDir };
