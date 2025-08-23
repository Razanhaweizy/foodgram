"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecipes } from "@/lib/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export function RecipesFeed() {
  const queryKey = ["recipes", { limit: 20, offset: 0 }];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => fetchRecipes({ limit: 20, offset: 0 }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-[#fceee9]/50"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-[#fceee9] p-4 text-[#667b68]">
        {(error as Error).message}
      </p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r) => (
        <RecipeCard key={r.id} recipe={r} queryKey={[queryKey]} />
      ))}
    </div>
  );
}
