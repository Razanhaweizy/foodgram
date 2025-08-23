import { apiFetch } from "@/lib/api";
import type { RecipesPage, Recipe } from "./types";

export async function fetchRecipes(params: {
  q?: string;
  limit?: number;
  offset?: number;
  sort_by?: "id" | "title" | "created_at";
  sort_dir?: "asc" | "desc";
  author_id?: number;     // works if you add backend support
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));
  if (params.sort_by) sp.set("sort_by", params.sort_by);
  if (params.sort_dir) sp.set("sort_dir", params.sort_dir);
  if (typeof params.author_id === "number") sp.set("author_id", String(params.author_id));

  const res = await apiFetch(`/recipes?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to load recipes");
  return (await res.json()) as RecipesPage;
}

export async function fetchMySavedRecipes(params: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));

  const res = await apiFetch(`/recipes/me/saves?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to load saved recipes");
  return (await res.json()) as RecipesPage;
}

export async function likeRecipe(recipeId: number) {
  const r = await apiFetch(`/recipes/${recipeId}/like`, { method: "POST" });
  if (!r.ok) throw new Error("Like failed");
}

export async function unlikeRecipe(recipeId: number) {
  const r = await apiFetch(`/recipes/${recipeId}/like`, { method: "DELETE" });
  if (!r.ok) throw new Error("Unlike failed");
}

export async function saveRecipe(recipeId: number) {
  const r = await apiFetch(`/recipes/${recipeId}/save`, { method: "POST" });
  if (!r.ok) throw new Error("Save failed");
}

export async function unsaveRecipe(recipeId: number) {
  const r = await apiFetch(`/recipes/${recipeId}/save`, { method: "DELETE" });
  if (!r.ok) throw new Error("Unsave failed");
}

export async function createRecipe(payload: {
  title: string;
  description?: string | null;
  ingredients: string[];
  steps: string[];
  tag_ids?: number[];
}): Promise<Recipe> {
  const r = await apiFetch("/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.detail ?? "Could not create recipe");
  }
  return r.json();
}
