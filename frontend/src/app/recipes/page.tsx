"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRecipes } from "@/lib/recipes";
import type { RecipesPage, Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Sidebar } from "@/components//SideBar";


export default function RecipesPage() {
  const [q, setQ] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const limit = 24;
  const offset = 0;

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const queryKey = ["recipes", { q: debounced, limit, offset, sort_by: "created_at", sort_dir: "desc" }] as const;

  const { data, isLoading, isError } = useQuery<RecipesPage>({
    queryKey,
    queryFn: () =>
      fetchRecipes({
        q: debounced,
        limit,
        offset,
        sort_by: "created_at",
        sort_dir: "desc",
      }),
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <Sidebar mode="browse"/>

        {/* Main content */}
        <div className="flex-1">
          {/* Search */}
          <div className="sticky top-0 z-10 mb-4 rounded-2xl border border-[#e6dffd] bg-white p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recipes…"
              className="w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none transition focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
            />
          </div>

          {/* Feed grid */}
          {isLoading && <p className="text-[#667b68]">Loading…</p>}
          {isError && <p className="text-red-600">Failed to load recipes</p>}

          {data?.items?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((r: Recipe) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  queryKey={[queryKey]}
                  clickableCard
                />
              ))}
            </div>
          ) : (
            !isLoading && <p className="text-[#667b68]">No recipes found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
