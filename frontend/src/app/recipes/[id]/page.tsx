"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getCurrentUserId } from "@/lib/auth-token";
import {
  fetchRecipeById,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
  deleteRecipe,
} from "@/lib/recipes";
import type { Recipe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Pencil, Trash2 } from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const meId = getCurrentUserId();

  // Fetch recipe
  const { data: recipe, isLoading, isError } = useQuery<Recipe>({
    queryKey: ["recipe", rid],
    queryFn: () => fetchRecipeById(rid),
  });

  // Utility to bump counts locally (optimistic feel)
  const setCounts = (partial: Partial<Pick<Recipe, "likes_count" | "saves_count">>) => {
    qc.setQueryData<Recipe>(["recipe", rid], (old) =>
      old ? { ...old, ...partial, likes_count: partial.likes_count ?? old.likes_count, saves_count: partial.saves_count ?? old.saves_count } : old
    );
  };

  // Mutations
  const likeMut = useMutation({
    mutationFn: () => likeRecipe(rid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["recipe", rid] });
      if (recipe) setCounts({ likes_count: recipe.likes_count + 1 });
    },
    onError: () => {
      if (recipe) setCounts({ likes_count: recipe.likes_count });
      toast.error("Couldn’t like");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  const unlikeMut = useMutation({
    mutationFn: () => unlikeRecipe(rid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["recipe", rid] });
      if (recipe) setCounts({ likes_count: Math.max(0, recipe.likes_count - 1) });
    },
    onError: () => {
      if (recipe) setCounts({ likes_count: recipe.likes_count });
      toast.error("Couldn’t unlike");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  const saveMut = useMutation({
    mutationFn: () => saveRecipe(rid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["recipe", rid] });
      if (recipe) setCounts({ saves_count: recipe.saves_count + 1 });
    },
    onError: () => {
      if (recipe) setCounts({ saves_count: recipe.saves_count });
      toast.error("Couldn’t save");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  const unsaveMut = useMutation({
    mutationFn: () => unsaveRecipe(rid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["recipe", rid] });
      if (recipe) setCounts({ saves_count: Math.max(0, recipe.saves_count - 1) });
    },
    onError: () => {
      if (recipe) setCounts({ saves_count: recipe.saves_count });
      toast.error("Couldn’t unsave");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  const delMut = useMutation({
    mutationFn: () => deleteRecipe(rid),
    onSuccess: () => {
      toast.success("Recipe deleted");
      qc.invalidateQueries({ queryKey: ["recipes"] });
      router.push("/recipes");
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  if (isLoading) return <div className="p-6 text-[#667b68]">Loading…</div>;
  if (isError || !recipe) return <div className="p-6 text-red-600">Recipe not found.</div>;

  const isOwner = meId === recipe.created_by_id;

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Title + counts */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#2b2b2b]">{recipe.title}</h1>
        <div className="flex items-center gap-4 text-sm text-[#667b68]">
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

      {/* Tags */}
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

      {/* Description */}
      {recipe.description && (
        <p className="mt-4 text-[#2b2b2b]">{recipe.description}</p>
      )}

      {/* Ingredients */}
      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold text-[#2b2b2b]">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5 text-[#2b2b2b]">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold text-[#2b2b2b]">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[#2b2b2b]">
          {recipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => likeMut.mutate()}
          disabled={likeMut.isPending}
          className="bg-[#667b68] text-white hover:brightness-105"
        >
          <Heart className="mr-2 size-4" /> Like
        </Button>
        <Button
          variant="outline"
          onClick={() => unlikeMut.mutate()}
          disabled={unlikeMut.isPending}
          className="border-[#e6dfdd] text-[#2b2b2b] hover:bg-[#dde6d5]/40"
        >
          Unlike
        </Button>
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="bg-[#a3b899] text-white hover:brightness-105"
        >
          <Bookmark className="mr-2 size-4" /> Save
        </Button>
        <Button
          variant="outline"
          onClick={() => unsaveMut.mutate()}
          disabled={unsaveMut.isPending}
          className="border-[#e6dfdd] text-[#2b2b2b] hover:bg-[#dde6d5]/40"
        >
          Unsave
        </Button>

        {isOwner && (
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/recipes/${rid}/edit`)}
              className="ml-auto border-[#e6dfdd] text-[#2b2b2b]"
            >
              <Pencil className="mr-2 size-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (delMut.isPending) return;
                if (confirm("Delete this recipe? This cannot be undone.")) {
                  delMut.mutate();
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 size-4" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
