export type UserSummary = {
  id: number;
  username: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type Recipe = {
  id: number;
  title: string;
  description?: string | null;
  ingredients: string[];
  steps: string[];
  tags?: Tag[];
  created_by: UserSummary;        
  created_at: string;             
  likes_count: number;
  saves_count: number;
};

export type RecipesPage = {
  items: Recipe[];
  total: number;
  limit: number;
  offset: number;
};
