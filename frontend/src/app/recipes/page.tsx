import { RecipesFeed } from "./recipes-feed";

export const dynamic = "force-dynamic"; // optional if you want fresh SSR each time

export default function RecipesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-[#2b2b2b]">Latest recipes</h1>
      <RecipesFeed />
    </main>
  );
}
