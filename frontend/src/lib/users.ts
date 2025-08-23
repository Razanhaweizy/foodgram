import { apiFetch } from "@/lib/api";

export type Me = {
  id: number;
  username: string;
  email: string;
};

export async function fetchMe(): Promise<Me> {
  const res = await apiFetch("/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export type UserPublic = {
  id: number;
  username: string;
  email: string;
};

export async function fetchUserById(id: number): Promise<UserPublic> {
  const res = await apiFetch(`/users/${id}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}