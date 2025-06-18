import axios from "axios";
import { CorrectiveAction } from "@store/slices/correctiveActionSlice";
import { cacheResponse } from "./apiService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const correctiveActionService = {
  async getCorrectiveActions(
    params: { page?: number; limit?: number; filters?: any } = {},
  ): Promise<{ data: CorrectiveAction[]; total: number }> {
    const { page = 1, limit = 10, filters = {} } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value as string);
      }
    });

    const response = await api.get(
      `/corrective-actions?${queryParams.toString()}`,
    );

    // Cache the response for offline access
    await cacheResponse(
      `/corrective-actions?${queryParams.toString()}`,
      response.data,
    );

    return response.data;
  },

  async getCorrectiveActionById(id: string): Promise<CorrectiveAction> {
    const response = await api.get(`/corrective-actions/${id}`);

    // Cache the response for offline access
    await cacheResponse(`/corrective-actions/${id}`, response.data);

    return response.data;
  },

  async createCorrectiveAction(
    correctiveAction: Omit<CorrectiveAction, "id" | "createdAt" | "updatedAt">,
  ): Promise<CorrectiveAction> {
    const response = await api.post("/corrective-actions", correctiveAction);
    return response.data;
  },

  async updateCorrectiveAction(
    id: string,
    data: Partial<CorrectiveAction>,
  ): Promise<CorrectiveAction> {
    const response = await api.put(`/corrective-actions/${id}`, data);
    return response.data;
  },

  async deleteCorrectiveAction(id: string): Promise<void> {
    await api.delete(`/corrective-actions/${id}`);
  },

  async completeCorrectiveAction(
    id: string,
    completionDetails: { comments?: string },
  ): Promise<CorrectiveAction> {
    const response = await api.post(
      `/corrective-actions/${id}/complete`,
      completionDetails,
    );
    return response.data;
  },

  async verifyCorrectiveAction(
    id: string,
    verificationDetails: { comments?: string },
  ): Promise<CorrectiveAction> {
    const response = await api.post(
      `/corrective-actions/${id}/verify`,
      verificationDetails,
    );
    return response.data;
  },

  async reopenCorrectiveAction(
    id: string,
    reason: string,
  ): Promise<CorrectiveAction> {
    const response = await api.post(`/corrective-actions/${id}/reopen`, {
      reason,
    });
    return response.data;
  },

  async assignCorrectiveAction(
    id: string,
    userId: string,
  ): Promise<CorrectiveAction> {
    const response = await api.post(`/corrective-actions/${id}/assign`, {
      userId,
    });
    return response.data;
  },

  async addComment(
    id: string,
    comment: string,
  ): Promise<{
    id: string;
    comment: string;
    createdBy: string;
    createdAt: string;
  }> {
    const response = await api.post(`/corrective-actions/${id}/comments`, {
      comment,
    });
    return response.data;
  },

  async uploadAttachment(
    id: string,
    file: File,
  ): Promise<{
    id: string;
    url: string;
    filename: string;
    contentType: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/corrective-actions/${id}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async deleteAttachment(id: string, attachmentId: string): Promise<void> {
    await api.delete(`/corrective-actions/${id}/attachments/${attachmentId}`);
  },

  async getCorrectiveActionStats(): Promise<any> {
    const response = await api.get("/corrective-actions/stats");

    // Cache the response for offline access
    await cacheResponse("/corrective-actions/stats", response.data);

    return response.data;
  },

  async exportCorrectiveActions(
    format: "csv" | "pdf" | "excel",
    filters?: any,
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append("format", format);

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value as string);
        }
      });
    }

    const response = await api.get(
      `/corrective-actions/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },
};
