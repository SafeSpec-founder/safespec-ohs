import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

export interface Report {
  id: string;
  title: string;
  description: string;
  type:
    | "incident"
    | "audit"
    | "compliance"
    | "safety"
    | "performance"
    | "custom";
  status: "draft" | "pending" | "approved" | "published" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  data: Record<string, any>;
  attachments: string[];
  tags: string[];
  visibility: "private" | "internal" | "public";
  template?: string;
  parameters?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: ReportField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "multiselect"
    | "textarea"
    | "file";
  required: boolean;
  options?: string[];
  validation?: Record<string, any>;
}

export interface ReportState {
  reports: Report[];
  templates: ReportTemplate[];
  currentReport: Report | null;
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    priority?: string;
    createdBy?: string;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ReportState = {
  reports: [],
  templates: [],
  currentReport: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (params: { page?: number; limit?: number; filters?: any } = {}) => {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.json();
  },
);

export const fetchReport = createAsyncThunk(
  "reports/fetchReport",
  async (reportId: string) => {
    const response = await fetch(`/api/reports/${reportId}`);
    return response.json();
  },
);

export const createReport = createAsyncThunk(
  "reports/createReport",
  async (reportData: Omit<Report, "id" | "createdAt" | "updatedAt">) => {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    return response.json();
  },
);

export const updateReport = createAsyncThunk(
  "reports/updateReport",
  async ({ id, updates }: { id: string; updates: Partial<Report> }) => {
    const response = await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
);

export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (reportId: string) => {
    await fetch(`/api/reports/${reportId}`, {
      method: "DELETE",
    });
    return reportId;
  },
);

export const fetchReportTemplates = createAsyncThunk(
  "reports/fetchReportTemplates",
  async () => {
    const response = await fetch("/api/reports/templates");
    return response.json();
  },
);

export const generateReport = createAsyncThunk(
  "reports/generateReport",
  async ({
    templateId,
    parameters,
  }: {
    templateId: string;
    parameters: Record<string, any>;
  }) => {
    const response = await fetch(`/api/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, parameters }),
    });
    return response.json();
  },
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ReportState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ReportState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentReport: (state, action: PayloadAction<Report | null>) => {
      state.currentReport = action.payload;
    },
    updateReportStatus: (
      state,
      action: PayloadAction<{ id: string; status: Report["status"] }>,
    ) => {
      const { id, status } = action.payload;
      const report = state.reports.find((r) => r.id === id);
      if (report) {
        report.status = status;
        report.updatedAt = new Date().toISOString();
      }
      if (state.currentReport && state.currentReport.id === id) {
        state.currentReport.status = status;
        state.currentReport.updatedAt = new Date().toISOString();
      }
    },
    addReportTag: (
      state,
      action: PayloadAction<{ id: string; tag: string }>,
    ) => {
      const { id, tag } = action.payload;
      const report = state.reports.find((r) => r.id === id);
      if (report && !report.tags.includes(tag)) {
        report.tags.push(tag);
      }
    },
    removeReportTag: (
      state,
      action: PayloadAction<{ id: string; tag: string }>,
    ) => {
      const { id, tag } = action.payload;
      const report = state.reports.find((r) => r.id === id);
      if (report) {
        report.tags = report.tags.filter((t) => t !== tag);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reports";
      })
      // Fetch single report
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      })
      // Create report
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
        state.pagination.total += 1;
      })
      // Update report
      .addCase(updateReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (
          state.currentReport &&
          state.currentReport.id === action.payload.id
        ) {
          state.currentReport = action.payload;
        }
      })
      // Delete report
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => r.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentReport && state.currentReport.id === action.payload) {
          state.currentReport = null;
        }
      })
      // Fetch templates
      .addCase(fetchReportTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })
      // Generate report
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
        state.pagination.total += 1;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPagination,
  setCurrentReport,
  updateReportStatus,
  addReportTag,
  removeReportTag,
} = reportSlice.actions;

export default reportSlice.reducer;

export const selectReports = (state: RootState) => state.reports;
