// src/components/RecipeForm.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";

type RecipeFormValues = {
  title: string;
  description?: string;
  ingredientsText: string; // newline-separated
  stepsText: string;       // newline-separated
  tagsText?: string;       // optional comma-separated ids for now
};

type Props = {
  initial?: Partial<RecipeFormValues>;
  submitLabel?: string;
  onSubmit: (values: {
    title: string;
    description?: string;
    ingredients: string[];
    steps: string[];
    tag_ids?: number[];
  }) => Promise<void>;
};

export default function RecipeForm({ initial, submitLabel = "Save Recipe", onSubmit }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<RecipeFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    ingredientsText: initial?.ingredientsText ?? "",
    stepsText: initial?.stepsText ?? "",
    tagsText: initial?.tagsText ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const ingredients = form.ingredientsText
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);
      const steps = form.stepsText
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);
      const tag_ids = (form.tagsText ?? "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter(n => !Number.isNaN(n));

      await onSubmit({
        title: form.title.trim(),
        description: (form.description ?? "").trim() || undefined,
        ingredients,
        steps,
        tag_ids: tag_ids.length ? tag_ids : undefined,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
          className="block w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="Best Pancakes"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
          className="block min-h-[90px] w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="Fluffy, easy breakfast…"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#667b68]">Ingredients (one per line)</label>
          <textarea
            required
            value={form.ingredientsText}
            onChange={(e) => setForm(s => ({ ...s, ingredientsText: e.target.value }))}
            className="block min-h-[150px] w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
            placeholder={"flour\nmilk\neggs"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#667b68]">Steps (one per line)</label>
          <textarea
            required
            value={form.stepsText}
            onChange={(e) => setForm(s => ({ ...s, stepsText: e.target.value }))}
            className="block min-h-[150px] w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
            placeholder={"mix\ncook"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">
          Tag IDs (comma separated, optional)
        </label>
        <input
          value={form.tagsText}
          onChange={(e) => setForm(s => ({ ...s, tagsText: e.target.value }))}
          className="block w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 outline-none focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="1,2,3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#667b68] px-4 py-3 font-medium text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
