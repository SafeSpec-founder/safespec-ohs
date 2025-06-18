// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import incidentReducer from "./slices/incidentSlice";
import documentReducer from "./slices/documentSlice";
import chatReducer from "./slices/chatSlice";
import correctiveActionReducer from "./slices/correctiveActionSlice";
import tenantReducer from "./slices/tenantSlice";

import notificationReducer from "./slices/notificationSlice";
import reportReducer from "./slices/reportSlice";
import settingsReducer from "./slices/settingsSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    incidents: incidentReducer,
    documents: documentReducer,
    chat: chatReducer,
    correctiveActions: correctiveActionReducer,
    tenant: tenantReducer,

    // ✅ Newly added slices
    notifications: notificationReducer,
    reports: reportReducer,
    settings: settingsReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/loginSuccess", "documents/uploadSuccess"],
        ignoredActionPaths: ["payload.timestamp", "meta.timestamp"],
        ignoredPaths: ["documents.currentDocument.file"],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
