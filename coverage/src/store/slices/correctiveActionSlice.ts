import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { correctiveActionService } from "@services/correctiveActionService";

export interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "overdue" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  relatedIncidentId?: string;
  relatedHazardId?: string;
  completedDate?: string;
  completedBy?: string;
  verifiedBy?: string;
  verificationDate?: string;
  comments?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface CorrectiveActionState {
  correctiveActions: CorrectiveAction[];
  currentCorrectiveAction: CorrectiveAction | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: CorrectiveActionState = {
  correctiveActions: [],
  currentCorrectiveAction: null,
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
export const fetchCorrectiveActions = createAsyncThunk(
  "correctiveActions/fetchCorrectiveActions",
  async (
    params: { page?: number; limit?: number; filters?: any },
    { rejectWithValue },
  ) => {
    try {
      return await correctiveActionService.getCorrectiveActions(params);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch corrective actions",
      );
    }
  },
);

export const fetchCorrectiveActionById = createAsyncThunk(
  "correctiveActions/fetchCorrectiveActionById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await correctiveActionService.getCorrectiveActionById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch corrective action",
      );
    }
  },
);

export const createCorrectiveAction = createAsyncThunk(
  "correctiveActions/createCorrectiveAction",
  async (
    correctiveAction: Omit<CorrectiveAction, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      return await correctiveActionService.createCorrectiveAction(
        correctiveAction,
      );
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to create corrective action",
      );
    }
  },
);

export const updateCorrectiveAction = createAsyncThunk(
  "correctiveActions/updateCorrectiveAction",
  async (
    { id, data }: { id: string; data: Partial<CorrectiveAction> },
    { rejectWithValue },
  ) => {
    try {
      return await correctiveActionService.updateCorrectiveAction(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update corrective action",
      );
    }
  },
);

export const deleteCorrectiveAction = createAsyncThunk(
  "correctiveActions/deleteCorrectiveAction",
  async (id: string, { rejectWithValue }) => {
    try {
      await correctiveActionService.deleteCorrectiveAction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to delete corrective action",
      );
    }
  },
);

export const correctiveActionSlice = createSlice({
  name: "correctiveActions",
  initialState,
  reducers: {
    setCurrentCorrectiveAction: (
      state,
      action: PayloadAction<CorrectiveAction | null>,
    ) => {
      state.currentCorrectiveAction = action.payload;
    },
    clearCurrentCorrectiveAction: (state) => {
      state.currentCorrectiveAction = null;
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
      // Fetch corrective actions
      .addCase(fetchCorrectiveActions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCorrectiveActions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.correctiveActions = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchCorrectiveActions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch corrective action by ID
      .addCase(fetchCorrectiveActionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCorrectiveActionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCorrectiveAction = action.payload;
      })
      .addCase(fetchCorrectiveActionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create corrective action
      .addCase(createCorrectiveAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCorrectiveAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.correctiveActions.unshift(action.payload);
        state.currentCorrectiveAction = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createCorrectiveAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update corrective action
      .addCase(updateCorrectiveAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCorrectiveAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.correctiveActions.findIndex(
          (ca) => ca.id === action.payload.id,
        );
        if (index !== -1) {
          state.correctiveActions[index] = action.payload;
        }
        if (state.currentCorrectiveAction?.id === action.payload.id) {
          state.currentCorrectiveAction = action.payload;
        }
      })
      .addCase(updateCorrectiveAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete corrective action
      .addCase(deleteCorrectiveAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCorrectiveAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.correctiveActions = state.correctiveActions.filter(
          (ca) => ca.id !== action.payload,
        );
        if (state.currentCorrectiveAction?.id === action.payload) {
          state.currentCorrectiveAction = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteCorrectiveAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentCorrectiveAction,
  clearCurrentCorrectiveAction,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
} = correctiveActionSlice.actions;

// Selectors
export const selectCorrectiveActions = (state: RootState) =>
  state.correctiveActions.correctiveActions;
export const selectCurrentCorrectiveAction = (state: RootState) =>
  state.correctiveActions.currentCorrectiveAction;
export const selectCorrectiveActionsLoading = (state: RootState) =>
  state.correctiveActions.isLoading;
export const selectCorrectiveActionsError = (state: RootState) =>
  state.correctiveActions.error;
export const selectCorrectiveActionsFilters = (state: RootState) =>
  state.correctiveActions.filters;
export const selectCorrectiveActionsPagination = (state: RootState) =>
  state.correctiveActions.pagination;

export default correctiveActionSlice.reducer;
