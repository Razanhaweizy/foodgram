"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createRecipe } from "@/lib/recipes";
import RecipeForm from "@/components/RecipeForm";

export default function CreateRecipePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: createRecipe, // expects {title, description?, ingredients, steps, tag_ids?}
    onSuccess: (recipe) => {
      toast.success("Recipe created!");
      // refresh feeds and navigate to the new recipe
      qc.invalidateQueries({ queryKey: ["recipes"] });
      router.push(`/recipes/${recipe.id}`);
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Could not create recipe");
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-[#2b2b2b]">Create Recipe</h1>

      <RecipeForm
        initial={{
          title: "",
          description: "",
          ingredientsText: "",
          stepsText: "",
          // comma‑separated tag IDs (optional). Leave blank if you don’t use tags yet.
          tagsText: "",
        }}
        submitLabel={mut.isPending ? "Creating…" : "Create"}
        onSubmit={async (payload) => {
          // payload should already be: { title, description?, ingredients, steps, tag_ids? }
          await mut.mutateAsync(payload);
        }}
      />
    </div>
  );
}
