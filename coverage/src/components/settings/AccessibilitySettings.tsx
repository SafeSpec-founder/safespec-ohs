import React from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Box,
  Slider,
  Divider,
  Alert,
  Button,
} from "@mui/material";
import {
  Accessibility,
  Visibility,
  TextFields,
  Animation,
  VolumeUp,
  Keyboard,
  Mouse,
  Contrast,
} from "@mui/icons-material";

interface AccessibilitySettingsProps {
  settings: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    fontSize: number;
    focusIndicator: boolean;
    soundEnabled: boolean;
    colorBlindSupport: boolean;
  };
  onChange: (settings: any) => void;
  onTestSettings?: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  settings,
  onChange,
  onTestSettings,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    handleChange("fontSize", newValue as number);
  };

  const getAccessibilityScore = () => {
    let score = 0;
    if (settings.highContrast) score += 15;
    if (settings.largeText || settings.fontSize > 16) score += 15;
    if (settings.reducedMotion) score += 10;
    if (settings.screenReader) score += 20;
    if (settings.keyboardNavigation) score += 20;
    if (settings.focusIndicator) score += 10;
    if (settings.colorBlindSupport) score += 10;
    return score;
  };

  const accessibilityScore = getAccessibilityScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "info";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Basic";
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Accessibility sx={{ mr: 1 }} />
          <Typography variant="h6">Accessibility Settings</Typography>
        </Box>

        {/* Accessibility Score */}
        <Alert
          severity={getScoreColor(accessibilityScore) as any}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            Accessibility Score: <strong>{accessibilityScore}/100</strong> (
            {getScoreLabel(accessibilityScore)})
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {accessibilityScore >= 80 &&
              "Excellent accessibility configuration for all users."}
            {accessibilityScore >= 60 &&
              accessibilityScore < 80 &&
              "Good accessibility with room for improvement."}
            {accessibilityScore >= 40 &&
              accessibilityScore < 60 &&
              "Basic accessibility features enabled."}
            {accessibilityScore < 40 &&
              "Consider enabling more accessibility features for better user experience."}
          </Typography>
        </Alert>

        {/* Visual Accessibility */}
        <Typography variant="subtitle1" gutterBottom>
          Visual Accessibility
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) =>
                    handleChange("highContrast", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Contrast sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">High Contrast</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Increase contrast for better visibility
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.largeText}
                  onChange={(e) => handleChange("largeText", e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextFields sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Large Text</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use larger text sizes throughout the app
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.colorBlindSupport}
                  onChange={(e) =>
                    handleChange("colorBlindSupport", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Visibility sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Color Blind Support</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use patterns and shapes in addition to colors
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>

        {/* Font Size Control */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Font Size: {settings.fontSize}px
          </Typography>
          <Slider
            value={settings.fontSize}
            onChange={handleFontSizeChange}
            min={12}
            max={24}
            step={1}
            marks={[
              { value: 12, label: "Small" },
              { value: 16, label: "Normal" },
              { value: 20, label: "Large" },
              { value: 24, label: "Extra Large" },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Motion & Animation */}
        <Typography variant="subtitle1" gutterBottom>
          Motion & Animation
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    handleChange("reducedMotion", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Animation sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Reduced Motion</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Minimize animations and transitions
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Navigation & Interaction */}
        <Typography variant="subtitle1" gutterBottom>
          Navigation & Interaction
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.keyboardNavigation}
                  onChange={(e) =>
                    handleChange("keyboardNavigation", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Keyboard sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Keyboard Navigation</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enhanced keyboard navigation support
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.focusIndicator}
                  onChange={(e) =>
                    handleChange("focusIndicator", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Mouse sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">
                      Enhanced Focus Indicators
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clearer visual focus indicators
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Screen Reader Support */}
        <Typography variant="subtitle1" gutterBottom>
          Screen Reader Support
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.screenReader}
                  onChange={(e) =>
                    handleChange("screenReader", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VolumeUp sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">
                      Screen Reader Optimization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optimize for screen reader compatibility
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    handleChange("soundEnabled", e.target.checked)
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VolumeUp sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body1">Audio Feedback</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enable sound feedback for actions
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>

        {/* Test Settings */}
        <Box
          sx={{
            mt: 3,
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
                Test Accessibility Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preview how your settings affect the interface
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={onTestSettings}
              startIcon={<Accessibility />}
            >
              Test Settings
            </Button>
          </Box>
        </Box>

        {/* Accessibility Guidelines */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Accessibility Guidelines:</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Enable high contrast if you have difficulty distinguishing colors
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Use keyboard navigation if you prefer or need to navigate without
              a mouse
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Enable reduced motion if animations cause discomfort or
              distraction
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Screen reader optimization improves compatibility with assistive
              technologies
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
