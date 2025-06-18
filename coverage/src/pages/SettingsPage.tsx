import React from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/index";
import {
  selectSettings,
  updateUserSettings,
} from "../store/slices/settingsSlice";
import SaveIcon from "@mui/icons-material/Save";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import StorageIcon from "@mui/icons-material/Storage";
import LanguageIcon from "@mui/icons-material/Language";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsForm from "../components/settings/SettingsForm";
import NotificationSettings from "../components/settings/NotificationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import DataSettings from "../components/settings/DataSettings";
import RegionalSettings from "../components/settings/RegionalSettings";
import AccessibilitySettings from "../components/settings/AccessibilitySettings";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const [value, setValue] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [dataSettings, setDataSettings] = React.useState({
    dataRetention: 30,
    autoBackup: false,
    backupFrequency: "weekly" as "daily" | "weekly" | "monthly",
    exportFormat: "json" as "json" | "csv" | "pdf",
    anonymizeData: false,
    deleteAfterExport: false,
  });
  const [accessibilitySettings, setAccessibilitySettings] = React.useState({
    ...settings.userSettings.accessibility,
    fontSize: 16,
    focusIndicator: true,
    soundEnabled: false,
    colorBlindSupport: false,
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSaveSettings = async (updatedSettings: any) => {
    setIsSaving(true);
    try {
      await dispatch(updateUserSettings(updatedSettings)).unwrap();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSaveSettings(settings)}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </Box>

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="General"
              {...a11yProps(0)}
            />
            <Tab
              icon={<NotificationsIcon />}
              iconPosition="start"
              label="Notifications"
              {...a11yProps(1)}
            />
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Security"
              {...a11yProps(2)}
            />
            <Tab
              icon={<StorageIcon />}
              iconPosition="start"
              label="Data & Storage"
              {...a11yProps(3)}
            />
            <Tab
              icon={<LanguageIcon />}
              iconPosition="start"
              label="Regional"
              {...a11yProps(4)}
            />
            <Tab
              icon={<AccessibilityIcon />}
              iconPosition="start"
              label="Accessibility"
              {...a11yProps(5)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <SettingsForm
            settings={settings.userSettings}
            onSettingsChange={(newSettings: any) =>
              handleSaveSettings(newSettings)
            }
            onSave={() => handleSaveSettings(settings.userSettings)}
            onReset={() => {
              /* your reset logic here */
            }}
            loading={isSaving}
            error={settings.error ?? undefined}
            success={false}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <NotificationSettings
            settings={settings.userSettings.notifications}
            onChange={(notifications) =>
              handleSaveSettings({
                ...settings,
                userSettings: { ...settings.userSettings, notifications },
              })
            }
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <SecuritySettings
            settings={settings.userSettings.security}
            onChange={(security) =>
              handleSaveSettings({
                ...settings,
                userSettings: { ...settings.userSettings, security },
              })
            }
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <DataSettings
            settings={dataSettings}
            storageInfo={{
              used: 0,
              total: 1000000,
              unit: "MB",
            }}
            onChange={setDataSettings}
          />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <RegionalSettings
            settings={settings.userSettings.regional}
            onChange={(regional) =>
              handleSaveSettings({
                ...settings,
                userSettings: { ...settings.userSettings, regional },
              })
            }
          />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <AccessibilitySettings
            settings={accessibilitySettings}
            onChange={setAccessibilitySettings}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
