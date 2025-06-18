import api, { cacheResponse } from "./apiService";
import { Document } from "@store/slices/documentSlice";

export const documentService = {
  async getDocuments(
    params: { page?: number; limit?: number; filters?: any } = {},
  ): Promise<{ data: Document[]; total: number }> {
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

    const response = await api.get(`/documents?${queryParams.toString()}`);

    // Cache the response for offline access
    await cacheResponse(`/documents?${queryParams.toString()}`, response.data);

    return response.data;
  },

  async getDocumentById(id: string): Promise<Document> {
    const response = await api.get(`/documents/${id}`);

    // Cache the response for offline access
    await cacheResponse(`/documents/${id}`, response.data);

    return response.data;
  },

  async createDocument(
    document: Omit<Document, "id" | "version" | "createdAt" | "updatedAt">,
  ): Promise<Document> {
    const response = await api.post("/documents", document);
    return response.data;
  },

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async uploadDocumentFile(
    id: string,
    file: File,
  ): Promise<{
    id: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/documents/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async getDocumentVersions(id: string): Promise<any[]> {
    const response = await api.get(`/documents/${id}/versions`);

    // Cache the response for offline access
    await cacheResponse(`/documents/${id}/versions`, response.data);

    return response.data;
  },

  async restoreVersion(id: string, versionId: string): Promise<Document> {
    const response = await api.post(
      `/documents/${id}/versions/${versionId}/restore`,
    );
    return response.data;
  },

  async approveDocument(id: string, comments?: string): Promise<Document> {
    const response = await api.post(`/documents/${id}/approve`, { comments });
    return response.data;
  },

  async rejectDocument(id: string, reason: string): Promise<Document> {
    const response = await api.post(`/documents/${id}/reject`, { reason });
    return response.data;
  },

  async publishDocument(id: string): Promise<Document> {
    const response = await api.post(`/documents/${id}/publish`);
    return response.data;
  },

  async archiveDocument(id: string): Promise<Document> {
    const response = await api.post(`/documents/${id}/archive`);
    return response.data;
  },

  async getDocumentCategories(): Promise<string[]> {
    const response = await api.get("/documents/categories");

    // Cache the response for offline access
    await cacheResponse("/documents/categories", response.data);

    return response.data;
  },

  async exportDocument(
    id: string,
    format: "pdf" | "docx" | "html",
  ): Promise<Blob> {
    const response = await api.get(`/documents/${id}/export?format=${format}`, {
      responseType: "blob",
    } as any);

    return response.data;
  },

  async summarizeDocument(id: string): Promise<{ summary: string }> {
    const response = await api.get(`/documents/${id}/summarize`);
    return response.data;
  },
};
