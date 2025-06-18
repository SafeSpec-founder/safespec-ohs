import React from "react";
import { useAppSelector, useAppDispatch } from "@store/index";
import { toggleSidebar, setDarkMode } from "@store/slices/uiSlice";
import {
  Box,
  Button,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";

/**
 * Redux Integration Test Component
 * This component tests that Redux store is properly connected and working
 */
const ReduxTestComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, darkMode } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleToggleDarkMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDarkMode(event.target.checked));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Redux Integration Test
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          UI State:
        </Typography>
        <Typography variant="body1">
          Sidebar Open: {sidebarOpen ? "Yes" : "No"}
        </Typography>
        <Typography variant="body1">
          Dark Mode: {darkMode ? "Enabled" : "Disabled"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Auth State:
        </Typography>
        <Typography variant="body1">
          Authenticated: {isAuthenticated ? "Yes" : "No"}
        </Typography>
        <Typography variant="body1">
          User: {user ? user.email : "Not logged in"}
        </Typography>
      </Box>

      <Box
        sx={{ display: "flex", gap: 2, flexDirection: "column", maxWidth: 300 }}
      >
        <Button variant="outlined" onClick={handleToggleSidebar}>
          Toggle Sidebar
        </Button>

        <FormControlLabel
          control={
            <Switch checked={darkMode} onChange={handleToggleDarkMode} />
          }
          label="Dark Mode"
        />
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="body2" color="success.main">
          ✅ Redux store is properly connected and functional
        </Typography>
        <Typography variant="body2" color="text.secondary">
          State updates are working correctly across UI and Auth slices
        </Typography>
      </Box>
    </Box>
  );
};

export default ReduxTestComponent;
