"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RecipeForm from "@/components/RecipeForm";
import { createRecipe } from "@/lib/recipes";

export default function CreateRecipePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-[#2b2b2b]">Create a Recipe</h1>
      <RecipeForm
        submitLabel="Post Recipe"
        onSubmit={async (payload) => {
          const r = await createRecipe(payload);
          toast.success("Recipe created!");
          router.push(`/recipes/${r.id}`);
        }}
      />
    </div>
  );
}
