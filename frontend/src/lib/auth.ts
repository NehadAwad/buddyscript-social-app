import { apiFetch } from "./api";
import type { AuthResponse, PublicUser } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<PublicUser> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.user;
}

export async function register(payload: RegisterPayload): Promise<PublicUser> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.user;
}

export async function getCurrentUser(): Promise<PublicUser> {
  const data = await apiFetch<AuthResponse>("/auth/me");
  return data.user;
}

export async function logout(): Promise<void> {
  await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}
