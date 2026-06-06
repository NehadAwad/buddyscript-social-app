import { AppError } from "./AppError";

export interface FeedCursor {
  createdAt: Date;
  id: string;
}

export function encodeFeedCursor(cursor: FeedCursor): string {
  const payload = {
    t: cursor.createdAt.toISOString(),
    id: cursor.id,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeFeedCursor(value: string): FeedCursor {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const payload = JSON.parse(decoded) as { t?: string; id?: string };

    if (!payload.t || !payload.id) {
      throw new Error("Invalid cursor payload");
    }

    const createdAt = new Date(payload.t);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("Invalid cursor date");
    }

    return {
      createdAt,
      id: payload.id,
    };
  } catch {
    throw new AppError(400, "Invalid cursor");
  }
}
