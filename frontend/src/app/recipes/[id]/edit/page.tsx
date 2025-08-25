"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getCurrentUserId } from "@/lib/auth-token";
import { fetchRecipeById, updateRecipe } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";
import RecipeForm from "@/components/RecipeForm";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const meId = getCurrentUserId();

  // Load the recipe (typed)
  const { data: recipe, isLoading, isError } = useQuery<Recipe>({
    queryKey: ["recipe", rid],
    queryFn: () => fetchRecipeById(rid),
  });

  // Patch mutation
  const mut = useMutation({
    mutationFn: (patch: any) => updateRecipe(rid, patch),
    onSuccess: () => {
      toast.success("Recipe updated");
      // refresh detail + list and go back to detail
      qc.invalidateQueries({ queryKey: ["recipe", rid] });
      qc.invalidateQueries({ queryKey: ["recipes"] });
      router.push(`/recipes/${rid}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  if (isLoading) return <div className="p-6 text-[#667b68]">Loading…</div>;
  if (isError || !recipe) return <div className="p-6 text-red-600">Not found</div>;

  // ✅ Option A: use nested created_by.id
  if (meId !== recipe.created_by.id) {
    return <div className="p-6 text-[#667b68]">You can’t edit this recipe.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2b2b2b]">Edit Recipe</h1>
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-[#a3b899] px-3 py-2 text-sm text-white hover:brightness-105 cursor-pointer"
        >
          Back
        </button>
      </div>

      <RecipeForm
        initial={{
          title: recipe.title,
          description: recipe.description ?? "",
          ingredientsText: recipe.ingredients.join("\n"),
          stepsText: recipe.steps.join("\n"),
          // if you’re entering tag IDs as a comma list in the form:
          tagsText: (recipe.tags ?? []).map((t) => t.id).join(","),
        }}
        submitLabel={mut.isPending ? "Saving…" : "Save Changes"}
        onSubmit={async (payload) => {
          // payload should match your updateRecipe signature
          await mut.mutateAsync(payload);
        }}
      />
    </div>
  );
}
