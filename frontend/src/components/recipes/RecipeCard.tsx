"use client";

import type { Recipe } from "@/lib/types";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe } from "@/lib/recipes";
import { toast } from "sonner";
import { Heart, Bookmark } from "lucide-react";

type Props = {
  recipe: Recipe;
  /** The exact query key you used in useQuery for the feed. */
  queryKey?: QueryKey; // e.g. ["recipes", { limit: 20, offset: 0 }]
};

export function RecipeCard({
  recipe,
  queryKey = ["recipes", { limit: 20, offset: 0 }],
}: Props) {
  const qc = useQueryClient();

  /** Safely update a single recipe in the paged cache. */
  const updateRecipeInCache = (id: number, updater: (r: Recipe) => Recipe) => {
    qc.setQueryData(queryKey, (old: any) => {
      if (!old || !Array.isArray(old.items)) return old;
      return {
        ...old,
        items: old.items.map((r: Recipe) => (r.id === id ? updater(r) : r)),
      };
    });
  };

  const likeMut = useMutation({
    mutationFn: () => likeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      updateRecipeInCache(recipe.id, (r) => ({ ...r, likes_count: r.likes_count + 1 }));
    },
    onError: () => {
      // roll back by re-fetching (simple + safe), or manually revert:
      qc.invalidateQueries({ queryKey });
      toast.error("Couldn’t like recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const unlikeMut = useMutation({
    mutationFn: () => unlikeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      updateRecipeInCache(recipe.id, (r) => ({
        ...r,
        likes_count: Math.max(0, r.likes_count - 1),
      }));
    },
    onError: () => {
      qc.invalidateQueries({ queryKey });
      toast.error("Couldn’t unlike recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const saveMut = useMutation({
    mutationFn: () => saveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      updateRecipeInCache(recipe.id, (r) => ({ ...r, saves_count: r.saves_count + 1 }));
    },
    onError: () => {
      qc.invalidateQueries({ queryKey });
      toast.error("Couldn’t save recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const unsaveMut = useMutation({
    mutationFn: () => unsaveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      updateRecipeInCache(recipe.id, (r) => ({
        ...r,
        saves_count: Math.max(0, r.saves_count - 1),
      }));
    },
    onError: () => {
      qc.invalidateQueries({ queryKey });
      toast.error("Couldn’t unsave recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  return (
    <div className="rounded-2xl border border-[#e6dfdd] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-[#2b2b2b]">{recipe.title}</h3>
        <div className="flex items-center gap-3 text-sm text-[#667b68]">
          <div className="flex items-center gap-1">
            <Heart className="size-4" />
            <span>{recipe.likes_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="size-4" />
            <span>{recipe.saves_count}</span>
          </div>
        </div>
      </div>

      {recipe.description && (
        <p className="mt-2 line-clamp-3 text-sm text-[#667b68]">{recipe.description}</p>
      )}

      {recipe.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.tags.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-[#fceee9] px-2 py-1 text-xs text-[#667b68] ring-1 ring-[#f8d3c5]"
            >
              {t.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => likeMut.mutate()}
          disabled={likeMut.isPending}
          className="rounded-xl bg-[#667b68] px-3 py-2 text-sm text-white hover:brightness-105 disabled:opacity-60"
        >
          Like
        </button>
        <button
          onClick={() => unlikeMut.mutate()}
          disabled={unlikeMut.isPending}
          className="rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40 disabled:opacity-60"
        >
          Unlike
        </button>
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="rounded-xl bg-[#a3b899] px-3 py-2 text-sm text-white hover:brightness-105 disabled:opacity-60"
        >
          Save
        </button>
        <button
          onClick={() => unsaveMut.mutate()}
          disabled={unsaveMut.isPending}
          className="rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40 disabled:opacity-60"
        >
          Unsave
        </button>
      </div>
    </div>
  );
}
