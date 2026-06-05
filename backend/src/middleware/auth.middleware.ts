import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ACCESS_TOKEN_COOKIE } from "../utils/cookies";
import { AppError } from "../utils/AppError";

function extractAccessToken(req: Request): string | null {
  if (req.cookies?.[ACCESS_TOKEN_COOKIE]) {
    return req.cookies[ACCESS_TOKEN_COOKIE];
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    req.user = await authService.resolveUserFromAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
