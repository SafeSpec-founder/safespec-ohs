import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Inspection {
  id: string;
  title: string;
  description: string;
  type: "safety" | "quality" | "environmental" | "compliance";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  location: string;
  scheduledDate: string;
  completedDate?: string;
  checklist: InspectionItem[];
  findings: Finding[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  id: string;
  description: string;
  category: string;
  isCompliant: boolean | null;
  notes?: string;
  evidence?: string[];
  severity?: "low" | "medium" | "high" | "critical";
}

export interface Finding {
  id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  location: string;
  evidence: string[];
  correctiveActions: string[];
  status: "open" | "in-progress" | "resolved" | "verified";
  assignedTo?: string;
  dueDate?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  checklist: Omit<
    InspectionItem,
    "id" | "isCompliant" | "notes" | "evidence"
  >[];
}

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
