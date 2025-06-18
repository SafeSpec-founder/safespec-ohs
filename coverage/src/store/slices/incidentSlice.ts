import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { incidentService } from "@services/incidentService";

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "draft" | "reported" | "investigating" | "action_required" | "closed";
  reportedBy: string;
  assignedTo?: string;
  witnesses?: string[];
  attachments?: string[];
  rootCause?: string;
  correctiveActions?: string[];
  createdAt: string;
  updatedAt: string;
}

interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: IncidentState = {
  incidents: [],
  currentIncident: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchIncidents = createAsyncThunk(
  "incidents/fetchIncidents",
  async (
    params: { page?: number; limit?: number; filters?: any },
    { rejectWithValue },
  ) => {
    try {
      return await incidentService.getIncidents(params);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch incidents");
    }
  },
);

export const fetchIncidentById = createAsyncThunk(
  "incidents/fetchIncidentById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await incidentService.getIncidentById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch incident");
    }
  },
);

export const createIncident = createAsyncThunk(
  "incidents/createIncident",
  async (
    incident: Omit<Incident, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      return await incidentService.createIncident(incident);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create incident");
    }
  },
);

export const updateIncident = createAsyncThunk(
  "incidents/updateIncident",
  async (
    { id, data }: { id: string; data: Partial<Incident> },
    { rejectWithValue },
  ) => {
    try {
      return await incidentService.updateIncident(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update incident");
    }
  },
);

export const deleteIncident = createAsyncThunk(
  "incidents/deleteIncident",
  async (id: string, { rejectWithValue }) => {
    try {
      await incidentService.deleteIncident(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete incident");
    }
  },
);

export const incidentSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setCurrentIncident: (state, action: PayloadAction<Incident | null>) => {
      state.currentIncident = action.payload;
    },
    clearCurrentIncident: (state) => {
      state.currentIncident = null;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch incidents
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch incident by ID
      .addCase(fetchIncidentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentIncident = action.payload;
      })
      .addCase(fetchIncidentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create incident
      .addCase(createIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents.unshift(action.payload);
        state.currentIncident = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update incident
      .addCase(updateIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.incidents.findIndex(
          (incident) => incident.id === action.payload.id,
        );
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete incident
      .addCase(deleteIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = state.incidents.filter(
          (incident) => incident.id !== action.payload,
        );
        if (state.currentIncident?.id === action.payload) {
          state.currentIncident = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentIncident,
  clearCurrentIncident,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
} = incidentSlice.actions;

// Selectors
export const selectIncidents = (state: RootState) => state.incidents.incidents;
export const selectCurrentIncident = (state: RootState) =>
  state.incidents.currentIncident;
export const selectIncidentsLoading = (state: RootState) =>
  state.incidents.isLoading;
export const selectIncidentsError = (state: RootState) => state.incidents.error;
export const selectIncidentsFilters = (state: RootState) =>
  state.incidents.filters;
export const selectIncidentsPagination = (state: RootState) =>
  state.incidents.pagination;

export default incidentSlice.reducer;
