import api from "./api";

export const communityService = {
  getAll: async () => {
    const res = await api.get("/api/communities");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/communities/${id}`);
    return res.data;
  },

  getAds: async (id: string) => {
    const res = await api.get(`/api/communities/${id}/ads`);
    return res.data;
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    avatar_url?: string;
    banner_url?: string;
  }) => {
    const res = await api.post("/api/communities", data);
    return res.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      avatar_url?: string;
      banner_url?: string;
    }
  ) => {
    const res = await api.put(`/api/communities/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/api/communities/${id}`);
    return res.data;
  },
};
