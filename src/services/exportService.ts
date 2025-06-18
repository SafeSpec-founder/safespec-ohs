import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
  includeAttachments?: boolean;
}

export interface ExportJob {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export const exportService = {
  async exportData(type: string, options: ExportOptions): Promise<ExportJob> {
    const response = await api.post("/export", {
      type,
      options,
    });
    return response.data;
  },

  async getExportJob(jobId: string): Promise<ExportJob> {
    const response = await api.get(`/export/jobs/${jobId}`);
    return response.data;
  },

  async getExportJobs(): Promise<ExportJob[]> {
    const response = await api.get("/export/jobs");
    return response.data;
  },

  async downloadExport(jobId: string): Promise<Blob> {
    const response = await api.get(`/export/jobs/${jobId}/download`, {
      responseType: "blob",
    } as any);
    return response.data;
  },

  async cancelExportJob(jobId: string): Promise<void> {
    await api.delete(`/export/jobs/${jobId}`);
  },

  async getTemplates(): Promise<any[]> {
    const response = await api.get("/export/templates");
    return response.data;
  },

  async getReports(): Promise<any[]> {
    const response = await api.get("/export/reports");
    return response.data;
  },

  async getScheduledReports(): Promise<any[]> {
    const response = await api.get("/export/scheduled-reports");
    return response.data;
  },

  async generateReport(params: any): Promise<any> {
    const response = await api.post("/export/reports", params);
    return response.data;
  },

  async scheduleReport(params: any): Promise<any> {
    const response = await api.post("/export/scheduled-reports", params);
    return response.data;
  },

  async getReportDownloadUrl(reportId: string): Promise<string> {
    const response = await api.get(`/export/reports/${reportId}/download-url`);
    return response.data.url;
  },

  async deleteReport(reportId: string): Promise<void> {
    await api.delete(`/export/reports/${reportId}`);
  },

  async deleteScheduledReport(reportId: string): Promise<void> {
    await api.delete(`/export/scheduled-reports/${reportId}`);
  },

  async exportIncidents(options: ExportOptions): Promise<ExportJob> {
    return this.exportData("incidents", options);
  },

  async exportAudits(options: ExportOptions): Promise<ExportJob> {
    return this.exportData("audits", options);
  },

  async exportCompliance(options: ExportOptions): Promise<ExportJob> {
    return this.exportData("compliance", options);
  },

  async exportReports(options: ExportOptions): Promise<ExportJob> {
    return this.exportData("reports", options);
  },
};
