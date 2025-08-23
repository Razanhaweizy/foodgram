export type Tag = {
  id: number;
  name: string;
};

export type Recipe = {
  id: number;
  title: string;
  description: string | null;
  ingredients: string[];
  steps: string[];
  created_by_id: number;
  created_at: string;
  likes_count: number;
  saves_count: number;
  tags: Tag[];
};

export type RecipesPage = {
  items: Recipe[];
  total: number;
  limit: number;
  offset: number;
};
