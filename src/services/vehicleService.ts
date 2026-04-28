import api from "./api";

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
}

export interface VehicleModel {
  id: string;
  manufacturer_id: string;
  name: string;
  slug: string;
  vehicle_type?: string;
  generation?: string | null;
  image_url?: string | null;
}

export interface VehicleSearchResult {
  manufacturer: Pick<Manufacturer, "id" | "name" | "slug">;
  model: Pick<VehicleModel, "id" | "name" | "slug">;
  years: number[];
  seo_path: string;
}

export const vehicleService = {
  listManufacturers: async () => {
    const { data } = await api.get<Manufacturer[]>("/api/manufacturers");
    return data;
  },

  listModelsByManufacturer: async (manufacturerId: string) => {
    const { data } = await api.get<VehicleModel[]>(`/api/models/${manufacturerId}`);
    return data;
  },

  searchVehicles: async (q: string, manufacturerSlug?: string) => {
    const params = new URLSearchParams({ q });
    if (manufacturerSlug) params.set("manufacturer_slug", manufacturerSlug);
    const { data } = await api.get<VehicleSearchResult[]>(`/api/vehicles/search?${params.toString()}`);
    return data;
  },
};
