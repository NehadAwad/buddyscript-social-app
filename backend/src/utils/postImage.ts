import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { uploadsDir } from "../middleware/upload.middleware";

export const staticAssetsDir = path.resolve(process.cwd(), "assets/static");
export const FALLBACK_FILENAME = "post-fallback.png";
export const FALLBACK_IMAGE_PATH = path.join(staticAssetsDir, FALLBACK_FILENAME);
export const FALLBACK_IMAGE_URL =
  process.env.POST_FALLBACK_IMAGE_URL || "/static/post-fallback.png";

export function isEphemeralUploadUrl(imageUrl: string): boolean {
  return imageUrl.startsWith("/uploads/");
}

export function getUploadFilePath(imageUrl: string): string {
  return path.join(uploadsDir, path.basename(imageUrl));
}

export function ephemeralUploadExists(imageUrl: string | null): boolean {
  if (!imageUrl || !isEphemeralUploadUrl(imageUrl)) {
    return false;
  }

  return fs.existsSync(getUploadFilePath(imageUrl));
}

/** Resolves DB image paths; missing ephemeral uploads map to committed static fallback. */
export function resolvePostImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) {
    return null;
  }

  if (isEphemeralUploadUrl(imageUrl)) {
    return ephemeralUploadExists(imageUrl) ? imageUrl : FALLBACK_IMAGE_URL;
  }

  return imageUrl;
}

export function serveUploadWithFallback(req: Request, res: Response): void {
  const filename = path.basename(req.params.filename);

  if (!filename || filename === "." || filename === "..") {
    res.status(400).json({ message: "Invalid filename" });
    return;
  }

  const uploadPath = path.join(uploadsDir, filename);

  if (fs.existsSync(uploadPath)) {
    res.sendFile(uploadPath);
    return;
  }

  if (fs.existsSync(FALLBACK_IMAGE_PATH)) {
    res.sendFile(FALLBACK_IMAGE_PATH);
    return;
  }

  res.status(404).json({ message: "Image not found" });
}
