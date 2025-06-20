import api, { cacheResponse } from "./apiService";

export const procedureService = {
  async getCategories(): Promise<string[]> {
    const response = await api.get("/procedures/categories");

    // Cache the response for offline access
    await cacheResponse("/procedures/categories", response.data);

    return response.data;
  },
};
