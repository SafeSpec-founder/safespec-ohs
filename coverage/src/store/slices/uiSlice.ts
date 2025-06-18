import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  currentTheme: string;
  loading: {
    [key: string]: boolean;
  };
  alerts: Alert[];
  modalOpen: {
    [key: string]: boolean;
  };
}

export interface Alert {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  autoClose?: boolean;
  duration?: number;
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem("darkMode") === "true",
  currentTheme: localStorage.getItem("theme") || "default",
  loading: {},
  alerts: [],
  modalOpen: {},
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", String(state.darkMode));
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", String(action.payload));
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; isLoading: boolean }>,
    ) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload,
      );
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    setModalOpen: (
      state,
      action: PayloadAction<{ key: string; isOpen: boolean }>,
    ) => {
      state.modalOpen[action.payload.key] = action.payload.isOpen;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  setTheme,
  setLoading,
  addAlert,
  removeAlert,
  clearAlerts,
  setModalOpen,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectCurrentTheme = (state: RootState) => state.ui.currentTheme;
export const selectLoading = (key: string) => (state: RootState) =>
  state.ui.loading[key] || false;
export const selectAlerts = (state: RootState) => state.ui.alerts;
export const selectModalOpen = (key: string) => (state: RootState) =>
  state.ui.modalOpen[key] || false;

export default uiSlice.reducer;
