import axios from "axios";
import {
  Inspection,
  InspectionItem,
  InspectionTemplate,
  InspectionFinding as Finding,
} from "../models/Inspection";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// reuse types from models

export const inspectionService = {
  async getInspections(
    params: { page?: number; limit?: number; filters?: any } = {},
  ): Promise<{ data: Inspection[]; total: number }> {
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

    const response = await api.get(`/inspections?${queryParams.toString()}`);
    return response.data;
  },

  async getInspection(id: string): Promise<Inspection> {
    const response = await api.get(`/inspections/${id}`);
    return response.data;
  },

  async createInspection(templateId: string): Promise<Inspection> {
    const response = await api.post("/inspections", { templateId });
    return response.data;
  },

  async updateInspection(
    id: string,
    updates: Partial<Inspection>,
  ): Promise<Inspection> {
    const response = await api.put(`/inspections/${id}`, updates);
    return response.data;
  },

  async updateInspectionItem(
    inspectionId: string,
    itemId: string,
    updates: Partial<InspectionItem>,
  ): Promise<InspectionItem> {
    const response = await api.put(
      `/inspections/${inspectionId}/items/${itemId}`,
      updates,
    );
    return response.data;
  },

  async deleteInspection(id: string): Promise<void> {
    await api.delete(`/inspections/${id}`);
  },

  async getTemplates(): Promise<InspectionTemplate[]> {
    const response = await api.get("/inspections/templates");
    return response.data;
  },

  async completeInspection(id: string): Promise<Inspection> {
    const response = await api.put(`/inspections/${id}/complete`, {});
    return response.data;
  },

  async addFinding(
    inspectionId: string,
    itemId: string,
    finding: any,
  ): Promise<any> {
    const response = await api.post(`/inspections/${inspectionId}/findings`, {
      itemId,
      ...finding,
    });
    return response.data;
  },

  async updateFinding(
    inspectionId: string,
    findingId: string,
    updates: any,
  ): Promise<any> {
    const response = await api.put(
      `/inspections/${inspectionId}/findings/${findingId}`,
      updates,
    );
    return response.data;
  },

  async uploadEvidence(
    inspectionId: string,
    itemId: string,
    file: File,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    const response = await api.post(
      `/inspections/${inspectionId}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.url;
  },

  async exportInspection(id: string): Promise<string> {
    const response = await api.get(`/inspections/${id}/export`);
    return response.data.url;
  },

  async exportInspections(filters: any = {}): Promise<Blob> {
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
      `/inspections/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },
};
