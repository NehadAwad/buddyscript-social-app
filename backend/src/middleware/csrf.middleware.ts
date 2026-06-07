import { NextFunction, Request, Response } from "express";
import { getAllowedOrigins } from "../config/cors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

function isAllowedReferer(referer: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(
    (origin) => referer === origin || referer.startsWith(`${origin}/`)
  );
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const allowedOrigins = getAllowedOrigins();
  const origin = req.get("origin");
  const referer = req.get("referer");

  if (origin && isAllowedOrigin(origin, allowedOrigins)) {
    next();
    return;
  }

  if (referer && isAllowedReferer(referer, allowedOrigins)) {
    next();
    return;
  }

  res.status(403).json({ message: "Invalid or missing origin" });
}
