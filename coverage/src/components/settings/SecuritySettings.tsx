import React from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  Box,
  Alert,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  Security,
  VpnKey,
  Schedule,
  Notifications,
  Devices,
  Warning,
  CheckCircle,
} from "@mui/icons-material";

interface SecuritySettingsProps {
  settings: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginNotifications: boolean;
    deviceTracking: boolean;
  };
  onChange: (settings: any) => void;
  onEnable2FA?: () => void;
  onDisable2FA?: () => void;
  onViewDevices?: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onChange,
  onEnable2FA,
  onDisable2FA,
  onViewDevices,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const getSecurityScore = () => {
    let score = 0;
    if (settings.twoFactorEnabled) score += 30;
    if (settings.sessionTimeout <= 30) score += 20;
    if (settings.passwordExpiry <= 90) score += 20;
    if (settings.loginNotifications) score += 15;
    if (settings.deviceTracking) score += 15;
    return score;
  };

  const securityScore = getSecurityScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Moderate";
    return "Weak";
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Security sx={{ mr: 1 }} />
          <Typography variant="h6">Security Settings</Typography>
        </Box>

        {/* Security Score */}
        <Alert
          severity={getScoreColor(securityScore) as any}
          sx={{ mb: 3 }}
          icon={securityScore >= 80 ? <CheckCircle /> : <Warning />}
        >
          <Typography variant="body2">
            Security Score: <strong>{securityScore}/100</strong> (
            {getScoreLabel(securityScore)})
          </Typography>
          {securityScore < 80 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Consider enabling two-factor authentication and adjusting session
              settings to improve security.
            </Typography>
          )}
        </Alert>

        {/* Two-Factor Authentication */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VpnKey
                sx={{
                  mr: 1,
                  color: settings.twoFactorEnabled
                    ? "success.main"
                    : "text.secondary",
                }}
              />
              <Box>
                <Typography variant="body1">
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {settings.twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security to your account"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                color={settings.twoFactorEnabled ? "success" : "default"}
                size="small"
              />
              <Button
                variant={settings.twoFactorEnabled ? "outlined" : "contained"}
                color={settings.twoFactorEnabled ? "error" : "primary"}
                size="small"
                onClick={settings.twoFactorEnabled ? onDisable2FA : onEnable2FA}
              >
                {settings.twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Session Management */}
        <Typography variant="subtitle1" gutterBottom>
          Session Management
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Session Timeout (minutes)"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                handleChange("sessionTimeout", parseInt(e.target.value))
              }
              inputProps={{ min: 5, max: 480 }}
              helperText="Automatically log out after inactivity"
              InputProps={{
                startAdornment: (
                  <Schedule sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password Expiry (days)"
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) =>
                handleChange("passwordExpiry", parseInt(e.target.value))
              }
              inputProps={{ min: 30, max: 365 }}
              helperText="Force password change after this period"
              InputProps={{
                startAdornment: (
                  <VpnKey sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Monitoring & Alerts */}
        <Typography variant="subtitle1" gutterBottom>
          Monitoring & Alerts
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.loginNotifications}
                  onChange={(e) =>
                    handleChange("loginNotifications", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Notifications sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Login Notifications</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get notified when someone logs into your account
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.deviceTracking}
                  onChange={(e) =>
                    handleChange("deviceTracking", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Devices sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Device Tracking</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track and manage devices that access your account
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>

        {/* Device Management */}
        {settings.deviceTracking && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "background.default",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Trusted Devices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage devices that have access to your account
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onViewDevices}
                startIcon={<Devices />}
              >
                Manage Devices
              </Button>
            </Box>
          </Box>
        )}

        {/* Security Recommendations */}
        <Box
          sx={{ mt: 3, p: 2, backgroundColor: "info.light", borderRadius: 1 }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Security Recommendations
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {!settings.twoFactorEnabled && (
              <Typography component="li" variant="body2" color="text.secondary">
                Enable two-factor authentication for better account security
              </Typography>
            )}
            {settings.sessionTimeout > 60 && (
              <Typography component="li" variant="body2" color="text.secondary">
                Consider reducing session timeout to 60 minutes or less
              </Typography>
            )}
            {settings.passwordExpiry > 90 && (
              <Typography component="li" variant="body2" color="text.secondary">
                Set password expiry to 90 days or less for better security
              </Typography>
            )}
            {!settings.loginNotifications && (
              <Typography component="li" variant="body2" color="text.secondary">
                Enable login notifications to monitor account access
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
