import { apiFetch } from "./api";
import type { LikeState, LikeTargetType, LikersResponse } from "@/types/like";

export async function likeTarget(
  targetId: string,
  targetType: LikeTargetType
): Promise<LikeState> {
  return apiFetch<LikeState>("/likes", {
    method: "POST",
    body: JSON.stringify({ targetId, targetType }),
  });
}

export async function unlikeTarget(
  targetId: string,
  targetType: LikeTargetType
): Promise<LikeState> {
  const params = new URLSearchParams({ targetId, targetType });
  return apiFetch<LikeState>(`/likes?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function listLikers(
  targetId: string,
  targetType: LikeTargetType,
  limit = 20,
  cursor?: string
): Promise<LikersResponse> {
  const params = new URLSearchParams({ type: targetType, limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }

  return apiFetch<LikersResponse>(`/likes/${targetId}/users?${params.toString()}`);
}
