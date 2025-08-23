// src/lib/recipes.ts
import { apiFetch } from "@/lib/api";
import type { RecipesPage, Recipe } from "./types";

/** Allowed sort fields & directions (tweak to match your backend) */
type SortBy = "created_at" | "title" | "id";
type SortDir = "asc" | "desc";

type ListParams = {
  q?: string;
  limit?: number;
  offset?: number;
  sort_by?: SortBy;
  sort_dir?: SortDir;
};

// LIST
export async function fetchRecipes(params?: ListParams) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.sort_by) qs.set("sort_by", params.sort_by);
  if (params?.sort_dir) qs.set("sort_dir", params.sort_dir);

  const res = await apiFetch(`/recipes${qs.toString() ? `?${qs.toString()}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return (await res.json()) as RecipesPage;
}

// GET BY ID
export async function fetchRecipeById(id: number) {
  const res = await apiFetch(`/recipes/${id}`);
  if (!res.ok) throw new Error("Recipe not found");
  return (await res.json()) as Recipe;
}

// CREATE
export async function createRecipe(input: {
  title: string;
  description?: string | null;
  ingredients: string[];
  steps: string[];
  tag_ids?: number[];
}) {
  const res = await apiFetch("/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to create recipe");
  }
  return (await res.json()) as Recipe;
}

// UPDATE
export async function updateRecipe(
  id: number,
  patch: Partial<{
    title: string;
    description: string | null;
    ingredients: string[];
    steps: string[];
    tag_ids: number[];
  }>
) {
  const res = await apiFetch(`/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to update recipe");
  }
  return (await res.json()) as Recipe;
}

// DELETE
export async function deleteRecipe(id: number) {
  const res = await apiFetch(`/recipes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to delete recipe");
  }
  return true;
}

// LIKE/SAVE
export async function likeRecipe(id: number) {
  const r = await apiFetch(`/recipes/${id}/like`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to like");
  return r.json();
}

export async function unlikeRecipe(id: number) {
  const r = await apiFetch(`/recipes/${id}/like`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to unlike");
  return r.json();
}

export async function saveRecipe(id: number) {
  const r = await apiFetch(`/recipes/${id}/save`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to save");
  return r.json();
}

export async function unsaveRecipe(id: number) {
  const r = await apiFetch(`/recipes/${id}/save`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to unsave");
  return r.json();
}
