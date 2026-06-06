export type LikeTargetType = "post" | "comment";

export interface LikeState {
  targetId: string;
  targetType: LikeTargetType;
  likeCount: number;
  isLikedByMe: boolean;
}

export interface LikerUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface LikersResponse {
  users: LikerUser[];
  nextCursor: string | null;
}
