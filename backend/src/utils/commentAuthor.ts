import { User } from "../entities/User";

export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function toCommentAuthor(user: User): CommentAuthor {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  };
}
