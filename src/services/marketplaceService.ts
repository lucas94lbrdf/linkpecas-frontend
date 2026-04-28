import api from "./api";

export const marketplaceService = {
  getAll: async () => {
    const res = await api.get("/api/marketplaces");
    return res.data;
  },

  create: async (data: { name: string; slug: string; icon_url?: string }) => {
    const res = await api.post("/api/marketplaces", data);
    return res.data;
  },

  update: async (
    id: string,
    data: { name?: string; slug?: string; icon_url?: string; is_active?: boolean }
  ) => {
    const res = await api.put(`/api/marketplaces/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/api/marketplaces/${id}`);
    return res.data;
  },
};
