import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useOffline } from "../../contexts/OfflineContext";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import SyncIcon from "@mui/icons-material/Sync";

interface OfflineStatusProps {
  position?: "top" | "bottom";
  showSyncButton?: boolean;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({
  position = "bottom",
  showSyncButton = true,
}) => {
  const theme = useTheme();
  const { isOnline, isSyncing, pendingSyncCount, manualSync, lastSyncTime } =
    useOffline();

  // Don't show anything if online and no pending changes
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  // Format last sync time
  const formattedLastSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleString()
    : "Never";

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        [position]: 20,
        right: 20,
        zIndex: 1000,
        padding: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: isOnline
          ? theme.palette.warning.light
          : theme.palette.error.main,
        color: "#fff",
        maxWidth: "100%",
        width: "auto",
        borderRadius: 2,
      }}
    >
      {!isOnline ? <WifiOffIcon /> : <SyncIcon />}

      <Box>
        <Typography variant="body1" fontWeight="bold">
          {!isOnline
            ? "You are offline"
            : `${pendingSyncCount} changes pending sync`}
        </Typography>

        <Typography variant="caption" display="block">
          {!isOnline
            ? "Changes will sync when you reconnect"
            : `Last sync: ${formattedLastSync}`}
        </Typography>
      </Box>

      {isOnline && showSyncButton && pendingSyncCount > 0 && (
        <Button
          variant="contained"
          color="inherit"
          size="small"
          onClick={manualSync}
          disabled={isSyncing}
          startIcon={
            isSyncing ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{ ml: 1, color: theme.palette.warning.main, bgcolor: "#fff" }}
        >
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </Paper>
  );
};

export default OfflineStatus;
