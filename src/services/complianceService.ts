import axios from "axios";
import { ComplianceItem, ComplianceCategory } from "../models";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const complianceService = {
  async getComplianceItems(
    params: { page?: number; limit?: number; filters?: any } = {},
  ): Promise<{ data: ComplianceItem[]; total: number }> {
    const { page = 1, limit = 10, filters = {} } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value as string);
        }
      });
    }

    const response = await api.get(
      `/compliance/items?${queryParams.toString()}`,
    );
    return response.data;
  },

  async getComplianceCategories(): Promise<ComplianceCategory[]> {
    const response = await api.get("/compliance/categories");
    return response.data;
  },

  async updateComplianceItem(
    id: string,
    updates: Partial<ComplianceItem>,
  ): Promise<ComplianceItem> {
    const response = await api.put(`/compliance/items/${id}`, updates);
    return response.data;
  },

  async createComplianceItem(
    item: Omit<ComplianceItem, "id">,
  ): Promise<ComplianceItem> {
    const response = await api.post("/compliance/items", item);
    return response.data;
  },

  async deleteComplianceItem(id: string): Promise<void> {
    await api.delete(`/compliance/items/${id}`);
  },

  async exportCompliance(filters: any = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value as string);
        }
      });
    }

    const response = await api.get(
      `/compliance/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },

  async getComplianceReport(
    params: { startDate?: string; endDate?: string; category?: string } = {},
  ): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.category) queryParams.append("category", params.category);

    const response = await api.get(
      `/compliance/report?${queryParams.toString()}`,
    );
    return response.data;
  },

  async getCategoryItems(categoryId: string): Promise<ComplianceItem[]> {
    const response = await api.get(
      `/compliance/categories/${categoryId}/items`,
    );
    return response.data;
  },

  async updateItemStatus(
    itemId: string,
    status: string,
  ): Promise<ComplianceItem> {
    const response = await api.patch(`/compliance/items/${itemId}/status`, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  async updateFinding(findingId: string, updates: any): Promise<any> {
    const response = await api.put(`/compliance/findings/${findingId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  async exportDashboard(filters: any = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value as string);
        }
      });
    }

    const response = await api.get(
      `/compliance/dashboard/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },
  async exportChecklist(
    categoryId?: string,
    format: "pdf" | "excel" | "csv" = "pdf",
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append("categoryId", categoryId);
    queryParams.append("format", format);

    const response = await api.get(
      `/compliance/export/checklist?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },

  async generatePrintableView(
    categoryId?: string,
    includeEvidence = false,
  ): Promise<string> {
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append("categoryId", categoryId);
    queryParams.append("includeEvidence", includeEvidence.toString());

    const response = await api.get(
      `/compliance/printable?${queryParams.toString()}`,
    );
    return response.data.html;
  },

  async exportCategory(
    categoryId: string,
    format: "pdf" | "excel" | "csv" = "pdf",
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append("format", format);

    const response = await api.get(
      `/compliance/categories/${categoryId}/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },

  async updateItem(
    itemId: string,
    updates: Partial<ComplianceItem>,
  ): Promise<ComplianceItem> {
    const response = await api.put(`/compliance/items/${itemId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  async getLocations(): Promise<any[]> {
    const response = await api.get("/compliance/locations");
    return response.data;
  },

  async getFindings(): Promise<any[]> {
    const response = await api.get("/compliance/findings");
    return response.data;
  },

  async getInspections(): Promise<any[]> {
    const response = await api.get("/compliance/inspections");
    return response.data;
  },

  async getFilteredFindings(filters: any): Promise<any[]> {
    const response = await api.post("/compliance/findings/filter", filters);
    return response.data;
  },
};
