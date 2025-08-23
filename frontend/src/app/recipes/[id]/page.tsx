"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchRecipeById,
  deleteRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
} from "@/lib/recipes";
import { fetchUserById } from "@/lib/users";
import { getCurrentUserId } from "@/lib/auth-token";
import type { Recipe } from "@/lib/types";
import {
  Heart,
  Bookmark,
  Pencil,
  Trash2,
  ArrowLeft,
  User as UserIcon,
} from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const meId = getCurrentUserId();

  // Typed query: Recipe
  const { data: recipe, isLoading, isError } = useQuery<Recipe>({
    queryKey: ["recipe", rid],
    queryFn: () => fetchRecipeById(rid),
  });

  // Author (after recipe arrives)
  const { data: author } = useQuery({
    queryKey: ["user", recipe?.created_by_id],
    enabled: !!recipe?.created_by_id,
    queryFn: () => fetchUserById(recipe!.created_by_id),
  });

  // Like / Unlike
  const likeMut = useMutation({
    mutationFn: () => likeRecipe(rid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });
  const unlikeMut = useMutation({
    mutationFn: () => unlikeRecipe(rid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  // Save / Unsave
  const saveMut = useMutation({
    mutationFn: () => saveRecipe(rid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });
  const unsaveMut = useMutation({
    mutationFn: () => unsaveRecipe(rid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", rid] }),
  });

  // Delete (owner only)
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

  // created_at is a string from API – format safely
  const createdAtText =
    recipe.created_at
      ? new Date(recipe.created_at as unknown as string).toLocaleDateString()
      : undefined;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a3b899] px-3 py-2 text-sm text-white hover:brightness-105"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/me"
            className="rounded-xl bg-[#a3b899] px-3 py-2 text-sm text-white hover:brightness-105"
          >
            My Page
          </Link>
          <Link
            href="/recipes"
            className="rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40"
          >
            Browse Recipes
          </Link>
        </div>
      </div>

      {/* Title + author + owner actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#2b2b2b]">{recipe.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#667b68]">
            <span className="inline-flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {author ? (
                <Link
                  href={`/users/${author.id}`}
                  className="underline underline-offset-2 hover:opacity-90"
                >
                  @{author.username}
                </Link>
              ) : (
                <>by user #{recipe.created_by_id}</>
              )}
            </span>
            {createdAtText && <span>• {createdAtText}</span>}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/recipes/${rid}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e6dfdd] px-3 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
            <button
              onClick={() => {
                if (delMut.isPending) return;
                if (confirm("Delete this recipe? This cannot be undone.")) {
                  delMut.mutate();
                }
              }}
              disabled={delMut.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e85c5c] px-3 py-2 text-sm text-white hover:brightness-105 disabled:opacity-60"
            >
              <Trash2 className="size-4" />
              {delMut.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Counts */}
      <div className="mt-2 flex items-center gap-4 text-sm text-[#667b68]">
        <span className="inline-flex items-center gap-1">
          <Heart className="size-4" />
          {recipe.likes_count}
        </span>
        <span className="inline-flex items-center gap-1">
          <Bookmark className="size-4" />
          {recipe.saves_count}
        </span>
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
        <h2 className="mb-2 font-medium text-[#2b2b2b]">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5 text-[#2b2b2b]">
          {recipe.ingredients.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mt-6">
        <h2 className="mb-2 font-medium text-[#2b2b2b]">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[#2b2b2b]">
          {recipe.steps.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-2">
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
