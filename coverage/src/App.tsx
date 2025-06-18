import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@store/index";
import theme from "@styles/theme";
import AppRouter from "@router/AppRouter";
import { AuthProvider } from "@contexts/AuthContext";
import { NotificationProvider } from "@contexts/NotificationContext";
import { OfflineProvider } from "@contexts/OfflineContext";
import { registerServiceWorker } from "@services/serviceWorkerRegistration";
import { initializeOfflineSync } from "@services/syncService";

const App: React.FC = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Initialize offline sync
    initializeOfflineSync();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <OfflineProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </OfflineProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
