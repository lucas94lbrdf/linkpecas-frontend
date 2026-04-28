import api from "./api";

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export const categoryService = {
  list: async () => {
    const response = await api.get<Category[]>("/api/categories/");
    return response.data;
  },

  create: async (data: CategoryCreate) => {
    const response = await api.post<Category>("/api/categories/", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CategoryCreate>) => {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/categories/${id}`);
  },
};
