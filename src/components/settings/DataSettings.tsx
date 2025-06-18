import React from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Box,
  Button,
  Divider,
  Alert,
  LinearProgress,
  Chip,
} from "@mui/material";
import { Storage, CloudDownload, Delete, Backup } from "@mui/icons-material";

interface DataSettingsProps {
  settings: {
    dataRetention: number;
    autoBackup: boolean;
    backupFrequency: "daily" | "weekly" | "monthly";
    exportFormat: "json" | "csv" | "pdf";
    anonymizeData: boolean;
    deleteAfterExport: boolean;
  };
  storageInfo: {
    used: number;
    total: number;
    unit: string;
  };
  onChange: (settings: any) => void;
  onExportData?: () => void;
  onDeleteData?: () => void;
  onBackupNow?: () => void;
}

const DataSettings: React.FC<DataSettingsProps> = ({
  settings,
  storageInfo,
  onChange,
  onExportData,
  onDeleteData,
  onBackupNow,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const storagePercentage = (storageInfo.used / storageInfo.total) * 100;
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "primary";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Storage sx={{ mr: 1 }} />
          <Typography variant="h6">Data Management</Typography>
        </Box>

        {/* Storage Usage */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Storage Usage
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Used: {formatBytes(storageInfo.used)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {formatBytes(storageInfo.total)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={storagePercentage}
              color={getStorageColor(storagePercentage)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {storagePercentage.toFixed(1)}% used
            </Typography>
          </Box>

          {storagePercentage >= 90 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Storage is almost full. Consider exporting or deleting old data.
            </Alert>
          )}

          {storagePercentage >= 75 && storagePercentage < 90 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Storage is getting full. You may want to clean up old data soon.
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Retention */}
        <Typography variant="subtitle1" gutterBottom>
          Data Retention
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Data Retention Period</InputLabel>
              <Select
                value={settings.dataRetention}
                label="Data Retention Period"
                onChange={(e) => handleChange("dataRetention", e.target.value)}
              >
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>6 months</MenuItem>
                <MenuItem value={365}>1 year</MenuItem>
                <MenuItem value={1095}>3 years</MenuItem>
                <MenuItem value={1825}>5 years</MenuItem>
                <MenuItem value={-1}>Never delete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.anonymizeData}
                  onChange={(e) =>
                    handleChange("anonymizeData", e.target.checked)
                  }
                />
              }
              label="Anonymize old data instead of deleting"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Backup Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Backup Settings
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoBackup}
                  onChange={(e) => handleChange("autoBackup", e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Backup sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Automatic Backups</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically backup your data at regular intervals
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          {settings.autoBackup && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  label="Backup Frequency"
                  onChange={(e) =>
                    handleChange("backupFrequency", e.target.value)
                  }
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Backup />}
            onClick={onBackupNow}
            size="small"
          >
            Backup Now
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Export */}
        <Typography variant="subtitle1" gutterBottom>
          Data Export
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={settings.exportFormat}
                label="Export Format"
                onChange={(e) => handleChange("exportFormat", e.target.value)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.deleteAfterExport}
                  onChange={(e) =>
                    handleChange("deleteAfterExport", e.target.checked)
                  }
                />
              }
              label="Delete data after export"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={onExportData}
            size="small"
          >
            Export All Data
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Deletion */}
        <Typography variant="subtitle1" gutterBottom>
          Data Deletion
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Data deletion is permanent and cannot be
            undone. Make sure to export your data before deletion if needed.
          </Typography>
        </Alert>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onDeleteData}
            size="small"
          >
            Delete All Data
          </Button>
        </Box>

        {/* Data Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "background.default",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Data Management Summary
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Retention: ${settings.dataRetention === -1 ? "Forever" : `${settings.dataRetention} days`}`}
              size="small"
              color="info"
            />
            <Chip
              label={`Backup: ${settings.autoBackup ? settings.backupFrequency : "Disabled"}`}
              size="small"
              color={settings.autoBackup ? "success" : "default"}
            />
            <Chip
              label={`Export: ${settings.exportFormat.toUpperCase()}`}
              size="small"
              color="primary"
            />
            {settings.anonymizeData && (
              <Chip
                label="Anonymization Enabled"
                size="small"
                color="secondary"
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataSettings;
