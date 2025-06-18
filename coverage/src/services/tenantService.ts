import api, { cacheResponse } from "./apiService";
import { Tenant } from "@store/slices/tenantSlice";

export const tenantService = {
  async getCurrentTenant(): Promise<Tenant> {
    const response = await api.get("/tenants/current");

    // Cache the response for offline access
    await cacheResponse("/tenants/current", response.data);

    return response.data;
  },

  async updateTenant(data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put("/tenants/current", data);
    return response.data;
  },

  async uploadLogo(file: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.post("/tenants/current/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async getUsers(): Promise<any[]> {
    const response = await api.get("/tenants/current/users");

    // Cache the response for offline access
    await cacheResponse("/tenants/current/users", response.data);

    return response.data;
  },

  async inviteUser(email: string, role: string): Promise<any> {
    const response = await api.post("/tenants/current/users/invite", {
      email,
      role,
    });
    return response.data;
  },

  async removeUser(userId: string): Promise<void> {
    await api.delete(`/tenants/current/users/${userId}`);
  },

  async updateUserRole(userId: string, role: string): Promise<any> {
    const response = await api.put(`/tenants/current/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  async getSubscriptionDetails(): Promise<any> {
    const response = await api.get("/tenants/current/subscription");

    // Cache the response for offline access
    await cacheResponse("/tenants/current/subscription", response.data);

    return response.data;
  },

  async updateSubscription(plan: string): Promise<any> {
    const response = await api.put("/tenants/current/subscription", { plan });
    return response.data;
  },

  async getModuleSettings(): Promise<any> {
    const response = await api.get("/tenants/current/settings/modules");

    // Cache the response for offline access
    await cacheResponse("/tenants/current/settings/modules", response.data);

    return response.data;
  },

  async updateModuleSettings(settings: any): Promise<any> {
    const response = await api.put(
      "/tenants/current/settings/modules",
      settings,
    );
    return response.data;
  },

  async getFeatureSettings(): Promise<any> {
    const response = await api.get("/tenants/current/settings/features");

    // Cache the response for offline access
    await cacheResponse("/tenants/current/settings/features", response.data);

    return response.data;
  },

  async updateFeatureSettings(settings: any): Promise<any> {
    const response = await api.put(
      "/tenants/current/settings/features",
      settings,
    );
    return response.data;
  },

  async getBranding(): Promise<any> {
    const response = await api.get("/tenants/current/branding");

    // Cache the response for offline access
    await cacheResponse("/tenants/current/branding", response.data);

    return response.data;
  },

  async updateBranding(branding: any): Promise<any> {
    const response = await api.put("/tenants/current/branding", branding);
    return response.data;
  },
};
