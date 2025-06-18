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
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import { Notifications, Email, Sms, Schedule } from "@mui/icons-material";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

interface NotificationSettingsProps {
  settings: {
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
  onChange: (settings: any) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
}) => {
  const handleChannelChange = (channel: string, enabled: boolean) => {
    onChange({
      ...settings,
      [channel]: enabled,
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    onChange({
      ...settings,
      frequency,
    });
  };

  const handleTypeChange = (type: string, enabled: boolean) => {
    onChange({
      ...settings,
      types: {
        ...settings.types,
        [type as keyof typeof settings.types]: enabled,
      },
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Email />;
      case "sms":
        return <Sms />;
      case "desktop":
        return <DesktopWindowsIcon />;
      default:
        return <Notifications />;
    }
  };

  const notificationTypes: {
    key: keyof typeof settings.types;
    label: string;
    description: string;
  }[] = [
    {
      key: "incidents",
      label: "Incident Reports",
      description: "New incidents and status updates",
    },
    {
      key: "audits",
      label: "Audit Activities",
      description: "Audit schedules and findings",
    },
    {
      key: "compliance",
      label: "Compliance Alerts",
      description: "Compliance deadlines and violations",
    },
    {
      key: "reminders",
      label: "Reminders",
      description: "Task deadlines and follow-ups",
    },
    {
      key: "system",
      label: "System Updates",
      description: "System maintenance and updates",
    },
  ];

  const enabledChannels = Object.entries(settings)
    .filter(
      ([key, value]) =>
        ["email", "push", "sms", "desktop"].includes(key) && value,
    )
    .map(([key]) => key);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Notifications sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Settings</Typography>
        </Box>

        {enabledChannels.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No notification channels are enabled. You won't receive any
            notifications.
          </Alert>
        )}

        {/* Notification Channels */}
        <Typography variant="subtitle1" gutterBottom>
          Notification Channels
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email}
                  onChange={(e) =>
                    handleChannelChange("email", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Email sx={{ mr: 1, fontSize: 20 }} />
                  Email Notifications
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.push}
                  onChange={(e) =>
                    handleChannelChange("push", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Notifications sx={{ mr: 1, fontSize: 20 }} />
                  Push Notifications
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sms}
                  onChange={(e) => handleChannelChange("sms", e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Sms sx={{ mr: 1, fontSize: 20 }} />
                  SMS Notifications
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.desktop}
                  onChange={(e) =>
                    handleChannelChange("desktop", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DesktopWindowsIcon sx={{ mr: 1, fontSize: 20 }} />
                  Desktop Notifications
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Notification Frequency */}
        <Typography variant="subtitle1" gutterBottom>
          Notification Frequency
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Frequency</InputLabel>
          <Select
            value={settings.frequency}
            label="Frequency"
            onChange={(e) => handleFrequencyChange(e.target.value)}
            startAdornment={<Schedule sx={{ mr: 1 }} />}
          >
            <MenuItem value="immediate">Immediate</MenuItem>
            <MenuItem value="hourly">Hourly Digest</MenuItem>
            <MenuItem value="daily">Daily Digest</MenuItem>
            <MenuItem value="weekly">Weekly Digest</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        {/* Notification Types */}
        <Typography variant="subtitle1" gutterBottom>
          Notification Types
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose which types of notifications you want to receive
        </Typography>

        <Grid container spacing={2}>
          {notificationTypes.map((type) => (
            <Grid item xs={12} key={type.key}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: settings.types[type.key]
                    ? "action.selected"
                    : "transparent",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        settings.types[type.key as keyof typeof settings.types]
                      }
                      onChange={(e) =>
                        handleTypeChange(type.key, e.target.checked)
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: "100%", m: 0 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "background.default",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Channels:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {enabledChannels.length > 0 ? (
              enabledChannels.map((channel) => (
                <Chip
                  key={channel}
                  label={channel}
                  size="small"
                  icon={getChannelIcon(channel)}
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Chip label="None" size="small" color="default" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
