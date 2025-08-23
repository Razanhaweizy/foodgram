// src/app/users/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchUserById, type UserPublic } from "@/lib/users";
import { fetchRecipes } from "@/lib/recipes";
import type { RecipesPage, Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function PublicUserPage() {
  const { id } = useParams<{ id: string }>();
  const uid = Number(id);

  // basic pagination knobs
  const limit = 20;
  const offset = 0;

  // fetch user
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<UserPublic>({
    queryKey: ["user", uid],
    queryFn: () => fetchUserById(uid),
  });

  // fetch their recipes
  const queryKey = ["recipes", { author_id: uid, limit, offset, sort_by: "created_at", sort_dir: "desc" }] as const;
  const {
    data: recipes,
    isLoading: recLoading,
    isError: recError,
  } = useQuery<RecipesPage>({
    queryKey,
    enabled: !userError,
    queryFn: () =>
      fetchRecipes({
        author_id: uid,
        limit,
        offset,
        sort_by: "created_at",
        sort_dir: "desc",
      }),
  });

  function onFollow() {
    // Placeholder until you implement follow system
    toast.info("Follow is coming soon ✨");
  }

  if (userLoading) return <div className="p-6 text-[#667b68]">Loading user…</div>;
  if (userError || !user) return <div className="p-6 text-red-600">User not found.</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Profile header */}
      <div className="flex items-center justify-between rounded-2xl border border-[#e6dfdd] bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#2b2b2b]">@{user.username}</h1>
          {/* hide email later if you want a stricter public profile */}
          <p className="text-sm text-[#667b68]">{user.email}</p>
        </div>
        <button
          onClick={onFollow}
          className="rounded-xl bg-[#667b68] px-4 py-2 text-sm text-white hover:brightness-105"
        >
          Follow
        </button>
      </div>

      {/* Their recipes */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-[#2b2b2b]">Recipes</h2>

        {recLoading && <p className="text-[#667b68]">Loading recipes…</p>}
        {recError && <p className="text-red-600">Failed to load recipes.</p>}

        {recipes?.items?.length ? (
          <div className="grid gap-4">
            {recipes.items.map((r: Recipe) => (
              <RecipeCard key={r.id} recipe={r} queryKey={[queryKey]} />
            ))}
          </div>
        ) : (
          !recLoading && <p className="text-[#667b68]">No recipes yet.</p>
        )}
      </div>
    </div>
  );
}
