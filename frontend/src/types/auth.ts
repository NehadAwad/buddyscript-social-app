export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
}
