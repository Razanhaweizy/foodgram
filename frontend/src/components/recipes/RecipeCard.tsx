"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe } from "@/lib/recipes";
import { toast } from "sonner";
import { Heart, Bookmark } from "lucide-react";

const cardBase = "rounded-2xl border border-[#e6dfdd] bg-white p-4 shadow-sm h-full";
const cardClickable = "transition hover:bg-[#dde6d5]/30 cursor-pointer";


type Props = {
  recipe: Recipe;
  /** Query keys whose caches should be updated/invalidated. 
   *  Pass the same keys you used in useQuery. */
  queryKey?: unknown[];
  /** If true, clicking the card navigates to /recipes/[id] */
  clickableCard?: boolean;
};

export function RecipeCard({
  recipe,
  queryKey = [["recipes", { limit: 20, offset: 0 }]],
  clickableCard = false,
}: Props) {
  const qc = useQueryClient();
  const router = useRouter();

  /** Helper: update counts based on current cache, not stale props */
  const bumpCounts = (bump: { like?: 1 | -1; save?: 1 | -1 }) => {
    for (const q of queryKey) {
      const key = q as any;
      qc.setQueryData(key, (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((r: Recipe) => {
            if (r.id !== recipe.id) return r;
            return {
              ...r,
              likes_count:
                r.likes_count + (bump.like ?? 0),
              saves_count:
                r.saves_count + (bump.save ?? 0),
            };
          }),
        };
      });
    }
  };

  const likeMut = useMutation({
    mutationFn: () => likeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      bumpCounts({ like: 1 });
    },
    onError: () => {
      bumpCounts({ like: -1 });
      toast.error("Couldn’t like recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
      qc.invalidateQueries({ queryKey: ["recipe", recipe.id] });
    },
  });

  const unlikeMut = useMutation({
    mutationFn: () => unlikeRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      bumpCounts({ like: -1 });
    },
    onError: () => {
      bumpCounts({ like: 1 });
      toast.error("Couldn’t unlike recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
      qc.invalidateQueries({ queryKey: ["recipe", recipe.id] });
    },
  });

  const saveMut = useMutation({
    mutationFn: () => saveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      bumpCounts({ save: 1 });
    },
    onError: () => {
      bumpCounts({ save: -1 });
      toast.error("Couldn’t save recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
      qc.invalidateQueries({ queryKey: ["recipe", recipe.id] });
    },
  });

  const unsaveMut = useMutation({
    mutationFn: () => unsaveRecipe(recipe.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKey[0] as any });
      bumpCounts({ save: -1 });
    },
    onError: () => {
      bumpCounts({ save: 1 });
      toast.error("Couldn’t unsave recipe");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey[0] as any });
      qc.invalidateQueries({ queryKey: ["recipe", recipe.id] });
    },
  });

  const cardBase =
    "rounded-2xl border border-[#e6dfdd] bg-white p-4 shadow-sm";
  const cardClickable =
    "transition hover:bg-[#dde6d5]/30 cursor-pointer";

  const goDetail = () => router.push(`/recipes/${recipe.id}`);

  return (
    <div
      className={`${cardBase} ${clickableCard ? cardClickable : ""}`}
      {...(clickableCard ? { onClick: goDetail } : {})}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Title -> always link to detail */}
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-lg font-semibold text-[#2b2b2b] hover:underline underline-offset-4"
          onClick={(e) => e.stopPropagation()}
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
