"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchMe } from "@/lib/users";
import { fetchRecipes, fetchMySavedRecipes } from "@/lib/recipes";
import type { Recipe, RecipesPage } from "@/lib/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";

// if your token helpers live elsewhere, adjust this import:
import { clearTokens } from "@/lib/validation/auth";

export default function MePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"mine" | "saved">("mine");

  // 1) Me
  const { data: me, isLoading: meLoading, isError: meError } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  // Pagination knobs (simple starters)
  const limit = 20;
  const [offsetMine] = React.useState(0);
  const [offsetSaved] = React.useState(0);

  // 2) My recipes
  const qMine = ["recipes", { author_id: me?.id, limit, offset: offsetMine, sort_by: "created_at", sort_dir: "desc" }] as const;
  const {
    data: mine,
    isLoading: mineLoading,
    isError: mineError,
  } = useQuery<RecipesPage>({
    queryKey: qMine,
    enabled: !!me?.id,
    queryFn: () =>
      fetchRecipes({
        author_id: me!.id,
        limit,
        offset: offsetMine,
        sort_by: "created_at",
        sort_dir: "desc",
      }),
  });

  // 3) My saved
  const qSaved = ["recipes_saved", { limit, offset: offsetSaved }] as const;
  const {
    data: saved,
    isLoading: savedLoading,
    isError: savedError,
  } = useQuery<RecipesPage>({
    queryKey: qSaved,
    enabled: !!me?.id,
    queryFn: () => fetchMySavedRecipes({ limit, offset: offsetSaved }),
  });

  function onLogout() {
    clearTokens();
    toast.success("Logged out");
    router.push("/login");
  }

  if (meLoading) return <div className="p-6 text-[#667b68]">Loading…</div>;
  if (meError || !me) {
    return (
      <div className="p-6">
        <p className="text-[#667b68]">You’re not signed in.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-3 rounded-xl bg-[#667b68] px-4 py-2 text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-[#e6dfdd] bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#2b2b2b]">@{me.username}</h1>
          <p className="text-sm text-[#667b68]">{me.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl border border-[#e6dfdd] px-4 py-2 text-sm text-[#2b2b2b] hover:bg-[#dde6d5]/40"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setActiveTab("mine")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "mine"
              ? "bg-[#667b68] text-white"
              : "border border-[#e6dfdd] text-[#2b2b2b] hover:bg-[#dde6d5]/40"
          }`}
        >
          My Recipes
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "saved"
              ? "bg-[#667b68] text-white"
              : "border border-[#e6dfdd] text-[#2b2b2b] hover:bg-[#dde6d5]/40"
          }`}
        >
          Saved
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "mine" ? (
          <Section
            title="My Recipes"
            loading={mineLoading}
            error={mineError}
            data={mine}
            queryKey={qMine as unknown as unknown[]}
          />
        ) : (
          <Section
            title="Saved Recipes"
            loading={savedLoading}
            error={savedError}
            data={saved}
            queryKey={qSaved as unknown as unknown[]}
          />
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  loading,
  error,
  data,
  queryKey,
}: {
  title: string;
  loading: boolean;
  error: boolean;
  data?: RecipesPage;
  queryKey: unknown[];
}) {
  if (loading) return <p className="text-[#667b68]">Loading {title}…</p>;
  if (error) return <p className="text-red-600">Failed to load {title.toLowerCase()}.</p>;

  return data?.items?.length ? (
    <div className="grid gap-4">
      {data.items.map((r: Recipe) => (
        <RecipeCard key={r.id} recipe={r} queryKey={[queryKey]} />
      ))}
    </div>
  ) : (
    <p className="text-[#667b68]">No {title.toLowerCase()} yet.</p>
  );
}
