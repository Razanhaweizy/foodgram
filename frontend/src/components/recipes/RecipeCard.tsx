"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe } from "@/lib/recipes";
import { toast } from "sonner";
import { Heart, Bookmark } from "lucide-react";

type Props = {
  recipe: Recipe;
  queryKey?: unknown[];
  /** if true, make the whole card clickable to the detail page */
  clickableCard?: boolean;
};

export function RecipeCard({
  recipe,
  queryKey = [["recipes", { limit: 20, offset: 0 }]],
  clickableCard = false,
}: Props) {
  const qc = useQueryClient();

  // --- optimistic helpers (unchanged) ---
  const updateCounts = (delta: Partial<Pick<Recipe, "likes_count" | "saves_count">>) => {
    for (const q of queryKey) {
      const key = q as any;
      qc.setQueryData(key, (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((r: Recipe) =>
            r.id === recipe.id
              ? {
                  ...r,
                  likes_count: delta.likes_count ?? r.likes_count,
                  saves_count: delta.saves_count ?? r.saves_count,
                }
              : r
          ),
        };
      });
    }
  };

  const likeMut = useMutation({
    mutationFn: () => likeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      updateCounts({ likes_count: recipe.likes_count + 1 });
    },
    onError: () => {
      updateCounts({ likes_count: Math.max(0, recipe.likes_count) });
      toast.error("Couldn’t like recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
    },
  });

  const unlikeMut = useMutation({
    mutationFn: () => unlikeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      updateCounts({ likes_count: Math.max(0, recipe.likes_count - 1) });
    },
    onError: () => {
      updateCounts({ likes_count: recipe.likes_count });
      toast.error("Couldn’t unlike recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
    },
  });

  const saveMut = useMutation({
    mutationFn: () => saveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      updateCounts({ saves_count: recipe.saves_count + 1 });
    },
    onError: () => {
      updateCounts({ saves_count: Math.max(0, recipe.saves_count) });
      toast.error("Couldn’t save recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
    },
  });

  const unsaveMut = useMutation({
    mutationFn: () => unsaveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      updateCounts({ saves_count: Math.max(0, recipe.saves_count - 1) });
    },
    onError: () => {
      updateCounts({ saves_count: recipe.saves_count });
      toast.error("Couldn’t unsave recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
    },
  });

  const cardBase =
    "rounded-2xl border border-[#e6dfdd] bg-white p-4 shadow-sm";
  const cardClickable =
    "transition hover:bg-[#dde6d5]/30 cursor-pointer";

  return (
    <div
      className={`${cardBase} ${clickableCard ? cardClickable : ""}`}
      {...(clickableCard ? { onClick: () => (window.location.href = `/recipes/${recipe.id}`) } : {})}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Title now links to /recipes/[id] */}
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-lg font-semibold text-[#2b2b2b] hover:underline underline-offset-4"
        >
          {recipe.title}
        </Link>

        {/* counts */}
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
        <p className="mt-2 line-clamp-3 text-sm text-[#667b68]">
          {recipe.description}
        </p>
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
          onClick={(e) => { e.stopPropagation(); likeMut.mutate(); }}
          disabled={likeMut.isPending}
          className="rounded-xl bg-[#667b68] px-3 py-2 text-sm text-white hover:brightness-105 disabled:opacity-60"
        >
          Like
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); unlikeMut.mutate(); }}
          disabled={unlikeMut.isPending}
          className="rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40 disabled:opacity-60"
        >
          Unlike
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); saveMut.mutate(); }}
          disabled={saveMut.isPending}
          className="rounded-xl bg-[#a3b899] px-3 py-2 text-sm text-white hover:brightness-105 disabled:opacity-60"
        >
          Save
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); unsaveMut.mutate(); }}
          disabled={unsaveMut.isPending}
          className="rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40 disabled:opacity-60"
        >
          Unsave
        </button>
      </div>
    </div>
  );
}
