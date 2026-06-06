import { User } from "../entities/User";

export interface LikerDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function toLikerDto(user: User): LikerDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  };
}

export interface LikeStateDto {
  targetId: string;
  targetType: "post" | "comment";
  likeCount: number;
  isLikedByMe: boolean;
}
