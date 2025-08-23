"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchRecipes } from "@/lib/recipes";
import type { RecipesPage as RecipesPageType, Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function RecipesPage() {
  const [q, setQ] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const limit = 20;
  const offset = 0;

  // debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const queryKey = ["recipes", { q: debounced, limit, offset, sort_by: "created_at", sort_dir: "desc" }] as const;

  const { data, isLoading, isError } = useQuery<RecipesPageType>({
    queryKey,
    queryFn: () =>
      fetchRecipes({
        q: debounced || undefined,
        limit,
        offset,
        sort_by: "created_at",
        sort_dir: "desc",
      }),
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header with Back + Search */}
      <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-[#f8d3c5] bg-[#fceee9] p-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[#667b68] px-4 py-2 text-sm text-white hover:brightness-105"
          >
            ← Back to My Page
          </Link>
          <div className="flex-1" />
        </div>
        <div className="mt-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes… (title, etc.)"
            className="w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          />
        </div>
      </div>

      {isLoading && <p className="text-[#667b68]">Loading…</p>}
      {isError && <p className="text-red-600">Failed to load recipes.</p>}

      {data?.items?.length ? (
        <div className="grid gap-4">
          {data.items.map((r: Recipe) => (
            <RecipeCard key={r.id} recipe={r} queryKey={[queryKey] as unknown as unknown[]} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <p className="text-[#667b68]">
            {debounced ? "No recipes match your search." : "No recipes yet."}
          </p>
        )
      )}
    </div>
  );
}
