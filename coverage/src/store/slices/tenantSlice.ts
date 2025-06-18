import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { tenantService } from "@services/tenantService";

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  subscription: {
    plan: "free" | "basic" | "professional" | "enterprise";
    status: "active" | "trial" | "expired" | "cancelled";
    expiryDate: string;
  };
  settings: {
    modules: {
      incidents: boolean;
      documents: boolean;
      training: boolean;
      risk: boolean;
      permits: boolean;
      ai: boolean;
      automation: boolean;
    };
    features: {
      offlineMode: boolean;
      multiLanguage: boolean;
      customForms: boolean;
      advancedReporting: boolean;
      apiAccess: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface TenantState {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentTenant: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCurrentTenant = createAsyncThunk(
  "tenant/fetchCurrentTenant",
  async (_, { rejectWithValue }) => {
    try {
      return await tenantService.getCurrentTenant();
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch tenant information",
      );
    }
  },
);

export const updateTenant = createAsyncThunk(
  "tenant/updateTenant",
  async (data: Partial<Tenant>, { rejectWithValue }) => {
    try {
      return await tenantService.updateTenant(data);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update tenant information",
      );
    }
  },
);

export const uploadTenantLogo = createAsyncThunk(
  "tenant/uploadTenantLogo",
  async (file: File, { rejectWithValue }) => {
    try {
      return await tenantService.uploadLogo(file);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload tenant logo");
    }
  },
);

export const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current tenant
      .addCase(fetchCurrentTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;
      })
      .addCase(fetchCurrentTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update tenant
      .addCase(updateTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload tenant logo
      .addCase(uploadTenantLogo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadTenantLogo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentTenant) {
          state.currentTenant.logo = action.payload.logo;
        }
      })
      .addCase(uploadTenantLogo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = tenantSlice.actions;

// Selectors
export const selectCurrentTenant = (state: RootState) =>
  state.tenant.currentTenant;
export const selectTenantLoading = (state: RootState) => state.tenant.isLoading;
export const selectTenantError = (state: RootState) => state.tenant.error;

export default tenantSlice.reducer;
