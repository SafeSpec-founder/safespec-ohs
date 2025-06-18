import api, { cacheResponse } from "./apiService";
import { Incident } from "@store/slices/incidentSlice";

export const incidentService = {
  async getIncidents(
    params: { page?: number; limit?: number; filters?: any } = {},
  ): Promise<{ data: Incident[]; total: number }> {
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

    const response = await api.get(`/incidents?${queryParams.toString()}`);

    // Cache the response for offline access
    await cacheResponse(`/incidents?${queryParams.toString()}`, response.data);

    return response.data;
  },

  async getIncidentById(id: string): Promise<Incident> {
    const response = await api.get(`/incidents/${id}`);

    // Cache the response for offline access
    await cacheResponse(`/incidents/${id}`, response.data);

    return response.data;
  },

  async createIncident(
    incident: Omit<Incident, "id" | "createdAt" | "updatedAt">,
  ): Promise<Incident> {
    const response = await api.post("/incidents", incident);
    return response.data;
  },

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident> {
    const response = await api.put(`/incidents/${id}`, data);
    return response.data;
  },

  async deleteIncident(id: string): Promise<void> {
    await api.delete(`/incidents/${id}`);
  },

  async uploadAttachment(
    incidentId: string,
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
      `/incidents/${incidentId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async deleteAttachment(
    incidentId: string,
    attachmentId: string,
  ): Promise<void> {
    await api.delete(`/incidents/${incidentId}/attachments/${attachmentId}`);
  },

  async assignIncident(incidentId: string, userId: string): Promise<Incident> {
    const response = await api.post(`/incidents/${incidentId}/assign`, {
      userId,
    });
    return response.data;
  },

  async closeIncident(
    incidentId: string,
    resolution: string,
  ): Promise<Incident> {
    const response = await api.post(`/incidents/${incidentId}/close`, {
      resolution,
    });
    return response.data;
  },

  async reopenIncident(incidentId: string, reason: string): Promise<Incident> {
    const response = await api.post(`/incidents/${incidentId}/reopen`, {
      reason,
    });
    return response.data;
  },

  async addComment(
    incidentId: string,
    comment: string,
  ): Promise<{
    id: string;
    comment: string;
    createdBy: string;
    createdAt: string;
  }> {
    const response = await api.post(`/incidents/${incidentId}/comments`, {
      comment,
    });
    return response.data;
  },

  async getIncidentStats(): Promise<any> {
    const response = await api.get("/incidents/stats");

    // Cache the response for offline access
    await cacheResponse("/incidents/stats", response.data);

    return response.data;
  },

  async exportIncidents(
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
      `/incidents/export?${queryParams.toString()}`,
      {
        responseType: "blob",
      } as any,
    );

    return response.data;
  },
};
