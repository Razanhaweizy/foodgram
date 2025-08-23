import { apiFetch } from "@/lib/api";
import type { RecipesPage } from "./types";

export async function fetchRecipes(params?: {
  q?: string;
  limit?: number;
  offset?: number;
  sort_by?: "id" | "title" | "created_at";
  sort_dir?: "asc" | "desc";
}) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  sp.set("limit", String(params?.limit ?? 20));
  sp.set("offset", String(params?.offset ?? 0));
  sp.set("sort_by", params?.sort_by ?? "created_at");
  sp.set("sort_dir", params?.sort_dir ?? "desc");

  const res = await apiFetch(`/recipes?${sp.toString()}`);
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({} as any)))?.detail ?? "Failed to load recipes";
    throw new Error(msg);
  }
  return (await res.json()) as RecipesPage;
}

export async function likeRecipe(id: number) {
  const res = await apiFetch(`/recipes/${id}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like");
  return res.json();
}

export async function unlikeRecipe(id: number) {
  const res = await apiFetch(`/recipes/${id}/like`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unlike");
  return res.json();
}

export async function saveRecipe(id: number) {
  const res = await apiFetch(`/recipes/${id}/save`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}

export async function unsaveRecipe(id: number) {
  const res = await apiFetch(`/recipes/${id}/save`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unsave");
  return res.json();
}
