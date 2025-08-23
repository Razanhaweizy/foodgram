// src/app/recipes/create/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import RecipeForm from "@/components/RecipeForm";
import { createRecipe } from "@/lib/recipes";

export default function CreateRecipePage() {
  const router = useRouter();

  const mut = useMutation({
    mutationFn: createRecipe,
    onSuccess: (recipe) => {
      toast.success("Recipe created!");
      router.push(`/recipes/${recipe.id}`);
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to create recipe");
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Top bar: exit options */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded-xl bg-[#667b68] px-4 py-2 text-sm text-white hover:brightness-105"
        >
          ← Back to My Page
        </Link>

        <Link
          href="/recipes"
          className="rounded-xl border border-[#e6dfdd] px-4 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40"
        >
          Browse Recipes
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-[#2b2b2b]">Create a Recipe</h1>

      <RecipeForm
        initial={{
          title: "",
          description: "",
          ingredientsText: "",
          stepsText: "",
          tagsText: "", // comma-separated tag IDs if you’re using them
        }}
        submitLabel={mut.isPending ? "Creating..." : "Create Recipe"}
        onSubmit={async (payload) => {
          // RecipeForm should give you { title, description, ingredients, steps, tag_ids? }
          await mut.mutateAsync(payload);
        }}
      />
    </div>
  );
}
