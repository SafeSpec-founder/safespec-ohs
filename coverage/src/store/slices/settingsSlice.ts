import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

export interface UserSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
    frequency: "immediate" | "hourly" | "daily" | "weekly";
    types: {
      incidents: boolean;
      audits: boolean;
      compliance: boolean;
      reminders: boolean;
      system: boolean;
    };
  };
  privacy: {
    profileVisibility: "public" | "internal" | "private";
    activityTracking: boolean;
    dataSharing: boolean;
    analyticsOptOut: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginNotifications: boolean;
    deviceTracking: boolean;
  };
  dashboard: {
    layout: "grid" | "list";
    widgets: string[];
    refreshInterval: number;
    autoRefresh: boolean;
  };
  regional: {
    country: string;
    region: string;
    complianceStandards: string[];
    regulatoryFramework: string;
  };
}

export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    scheduledAt?: string;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxFileSize: number;
    maxUsers: number;
    storageQuota: number;
    apiRateLimit: number;
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

export interface SettingsState {
  userSettings: UserSettings;
  systemSettings: SystemSettings;
  loading: boolean;
  error: string | null;
  saving: boolean;
  lastSaved?: string;
}

const defaultUserSettings: UserSettings = {
  theme: "light",
  language: "en",
  timezone: "UTC",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  currency: "USD",
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true,
    frequency: "immediate",
    types: {
      incidents: true,
      audits: true,
      compliance: true,
      reminders: true,
      system: true,
    },
  },
  privacy: {
    profileVisibility: "internal",
    activityTracking: true,
    dataSharing: false,
    analyticsOptOut: false,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    deviceTracking: true,
  },
  dashboard: {
    layout: "grid",
    widgets: ["incidents", "audits", "compliance", "metrics"],
    refreshInterval: 300,
    autoRefresh: true,
  },
  regional: {
    country: "US",
    region: "North America",
    complianceStandards: ["OSHA", "ISO 45001"],
    regulatoryFramework: "OSHA",
  },
};

const initialState: SettingsState = {
  userSettings: defaultUserSettings,
  systemSettings: {
    maintenance: {
      enabled: false,
      message: "",
    },
    features: {},
    limits: {
      maxFileSize: 10485760, // 10MB
      maxUsers: 1000,
      storageQuota: 1073741824, // 1GB
      apiRateLimit: 1000,
    },
    integrations: {},
  },
  loading: false,
  error: null,
  saving: false,
};

// Async thunks
export const fetchUserSettings = createAsyncThunk(
  "settings/fetchUserSettings",
  async () => {
    const response = await fetch("/api/settings/user");
    return response.json();
  },
);

export const updateUserSettings = createAsyncThunk(
  "settings/updateUserSettings",
  async (settings: Partial<UserSettings>) => {
    const response = await fetch("/api/settings/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return response.json();
  },
);

export const fetchSystemSettings = createAsyncThunk(
  "settings/fetchSystemSettings",
  async () => {
    const response = await fetch("/api/settings/system");
    return response.json();
  },
);

export const updateSystemSettings = createAsyncThunk(
  "settings/updateSystemSettings",
  async (settings: Partial<SystemSettings>) => {
    const response = await fetch("/api/settings/system", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return response.json();
  },
);

export const resetUserSettings = createAsyncThunk(
  "settings/resetUserSettings",
  async () => {
    const response = await fetch("/api/settings/user/reset", {
      method: "POST",
    });
    return response.json();
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateUserSettingsLocal: (
      state,
      action: PayloadAction<Partial<UserSettings>>,
    ) => {
      state.userSettings = { ...state.userSettings, ...action.payload };
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UserSettings["notifications"]>>,
    ) => {
      state.userSettings.notifications = {
        ...state.userSettings.notifications,
        ...action.payload,
      };
    },
    updatePrivacySettings: (
      state,
      action: PayloadAction<Partial<UserSettings["privacy"]>>,
    ) => {
      state.userSettings.privacy = {
        ...state.userSettings.privacy,
        ...action.payload,
      };
    },
    updateAccessibilitySettings: (
      state,
      action: PayloadAction<Partial<UserSettings["accessibility"]>>,
    ) => {
      state.userSettings.accessibility = {
        ...state.userSettings.accessibility,
        ...action.payload,
      };
    },
    updateSecuritySettings: (
      state,
      action: PayloadAction<Partial<UserSettings["security"]>>,
    ) => {
      state.userSettings.security = {
        ...state.userSettings.security,
        ...action.payload,
      };
    },
    updateDashboardSettings: (
      state,
      action: PayloadAction<Partial<UserSettings["dashboard"]>>,
    ) => {
      state.userSettings.dashboard = {
        ...state.userSettings.dashboard,
        ...action.payload,
      };
    },
    updateRegionalSettings: (
      state,
      action: PayloadAction<Partial<UserSettings["regional"]>>,
    ) => {
      state.userSettings.regional = {
        ...state.userSettings.regional,
        ...action.payload,
      };
    },
    toggleFeature: (state, action: PayloadAction<string>) => {
      const feature = action.payload;
      state.systemSettings.features[feature] =
        !state.systemSettings.features[feature];
    },
    updateIntegration: (
      state,
      action: PayloadAction<{ key: string; config: any }>,
    ) => {
      const { key, config } = action.payload;
      if (!state.systemSettings.integrations[key]) {
        state.systemSettings.integrations[key] = { enabled: false, config: {} };
      }
      state.systemSettings.integrations[key] = {
        ...state.systemSettings.integrations[key],
        ...config,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.userSettings = { ...state.userSettings, ...action.payload };
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user settings";
      })
      // Update user settings
      .addCase(updateUserSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.userSettings = { ...state.userSettings, ...action.payload };
        state.lastSaved = new Date().toISOString();
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update user settings";
      })
      // Fetch system settings
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = { ...state.systemSettings, ...action.payload };
      })
      // Update system settings
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = { ...state.systemSettings, ...action.payload };
      })
      // Reset user settings
      .addCase(resetUserSettings.fulfilled, (state, action) => {
        state.userSettings = action.payload;
        state.lastSaved = new Date().toISOString();
      });
  },
});

export const {
  updateUserSettingsLocal,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAccessibilitySettings,
  updateSecuritySettings,
  updateDashboardSettings,
  updateRegionalSettings,
  toggleFeature,
  updateIntegration,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSettings = (state: RootState) => state.settings;
