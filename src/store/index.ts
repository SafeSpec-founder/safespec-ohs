import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import incidentReducer from './slices/incidentSlice';
import documentReducer from './slices/documentSlice';
import chatReducer from './slices/chatSlice';
import correctiveActionReducer from './slices/correctiveActionSlice';
import tenantReducer from './slices/tenantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    incidents: incidentReducer,
    documents: documentReducer,
    chat: chatReducer,
    correctiveActions: correctiveActionReducer,
    tenant: tenantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'documents/uploadSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['documents.currentDocument.file'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
