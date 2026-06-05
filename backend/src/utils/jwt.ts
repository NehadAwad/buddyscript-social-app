import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "./AppError";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new AppError(500, "JWT access secret is not configured");
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
    "15m") as SignOptions["expiresIn"];
  return jwt.sign(payload, getAccessSecret(), { expiresIn });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, getAccessSecret());
    if (typeof decoded === "string" || !decoded.sub || !decoded.email) {
      throw new AppError(401, "Invalid access token");
    }
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    throw new AppError(401, "Invalid or expired access token");
  }
}

export function getRefreshTokenExpiry(): Date {
  const duration = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}
