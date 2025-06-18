import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { Save, Restore } from "@mui/icons-material";

interface SettingsFormProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSave,
  onReset,
  loading = false,
  error,
  success = false,
}) => {
  const handleChange = (field: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [field]: value,
    };
    onSettingsChange(updatedSettings);
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    };
    onSettingsChange(updatedSettings);
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* General Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme || "light"}
                  label="Theme"
                  onChange={(e) => handleChange("theme", e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language || "en"}
                  label="Language"
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone || "UTC"}
                  label="Timezone"
                  onChange={(e) => handleChange("timezone", e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Chicago">Central Time</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.dateFormat || "MM/DD/YYYY"}
                  label="Date Format"
                  onChange={(e) => handleChange("dateFormat", e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dashboard Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Layout</InputLabel>
                <Select
                  value={settings.dashboard?.layout || "grid"}
                  label="Layout"
                  onChange={(e) =>
                    handleNestedChange("dashboard", "layout", e.target.value)
                  }
                >
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="list">List</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Refresh Interval (seconds)"
                type="number"
                value={settings.dashboard?.refreshInterval || 300}
                onChange={(e) =>
                  handleNestedChange(
                    "dashboard",
                    "refreshInterval",
                    parseInt(e.target.value),
                  )
                }
                inputProps={{ min: 30, max: 3600 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.dashboard?.autoRefresh}
                    onChange={(e) =>
                      handleNestedChange(
                        "dashboard",
                        "autoRefresh",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Auto Refresh Dashboard"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Privacy Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Profile Visibility</InputLabel>
                <Select
                  value={settings.privacy?.profileVisibility || "internal"}
                  label="Profile Visibility"
                  onChange={(e) =>
                    handleNestedChange(
                      "privacy",
                      "profileVisibility",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.privacy?.activityTracking}
                    onChange={(e) =>
                      handleNestedChange(
                        "privacy",
                        "activityTracking",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Allow Activity Tracking"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy?.dataSharing || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "privacy",
                        "dataSharing",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Allow Data Sharing for Analytics"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy?.analyticsOptOut || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "privacy",
                        "analyticsOptOut",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Opt Out of Analytics"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={onReset}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsForm;
