"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCurrentUserId } from "@/lib/auth-token";
import { fetchRecipeById, updateRecipe } from "@/lib/recipes";
import RecipeForm from "@/components/RecipeForm";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const meId = getCurrentUserId();

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ["recipe", rid],
    queryFn: () => fetchRecipeById(rid),
  });

  const mut = useMutation({
    mutationFn: (patch: any) => updateRecipe(rid, patch),
    onSuccess: (r) => {
      toast.success("Recipe updated");
      qc.invalidateQueries({ queryKey: ["recipe", rid] });
      qc.invalidateQueries({ queryKey: ["recipes"] });
      router.push(`/recipes/${rid}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error || !recipe) return <div className="p-6">Not found</div>;

  // guard: only owner
  if (meId !== recipe.created_by_id) {
    return <div className="p-6">You can’t edit this recipe.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-[#2b2b2b]">Edit Recipe</h1>
      <RecipeForm
        initial={{
          title: recipe.title,
          description: recipe.description ?? "",
          ingredientsText: recipe.ingredients.join("\n"),
          stepsText: recipe.steps.join("\n"),
          tagsText: (recipe.tags ?? []).map(t => t.id).join(","),
        }}
        submitLabel="Save Changes"
        onSubmit={async (payload) => {await mut.mutateAsync(payload);}}

      />
    </div>
  );
}
