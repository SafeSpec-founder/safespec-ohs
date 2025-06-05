import React from 'react';
import { Box, Typography, Grid, Paper, Container, Button, Tabs, Tab } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@store/index';
import { selectSettings, updateSettings } from '@store/slices/settingsSlice';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import LanguageIcon from '@mui/icons-material/Language';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SettingsForm from '@components/settings/SettingsForm';
import NotificationSettings from '@components/settings/NotificationSettings';
import SecuritySettings from '@components/settings/SecuritySettings';
import DataSettings from '@components/settings/DataSettings';
import RegionalSettings from '@components/settings/RegionalSettings';
import AccessibilitySettings from '@components/settings/AccessibilitySettings';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const [value, setValue] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSaveSettings = async (updatedSettings: any) => {
    setIsSaving(true);
    try {
      await dispatch(updateSettings(updatedSettings)).unwrap();
      // Show success message
    } catch (error) {
      // Show error message
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSaveSettings(settings)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </Box>

      <Paper sx={{ width: '100%', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<SettingsForm />} iconPosition="start" label="General" {...a11yProps(0)} />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" {...a11yProps(1)} />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" {...a11yProps(2)} />
            <Tab icon={<StorageIcon />} iconPosition="start" label="Data & Storage" {...a11yProps(3)} />
            <Tab icon={<LanguageIcon />} iconPosition="start" label="Regional" {...a11yProps(4)} />
            <Tab icon={<AccessibilityIcon />} iconPosition="start" label="Accessibility" {...a11yProps(5)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <SettingsForm 
            settings={settings.general} 
            onSave={(generalSettings) => handleSaveSettings({ ...settings, general: generalSettings })} 
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <NotificationSettings 
            settings={settings.notifications} 
            onSave={(notificationSettings) => handleSaveSettings({ ...settings, notifications: notificationSettings })} 
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <SecuritySettings 
            settings={settings.security} 
            onSave={(securitySettings) => handleSaveSettings({ ...settings, security: securitySettings })} 
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <DataSettings 
            settings={settings.data} 
            onSave={(dataSettings) => handleSaveSettings({ ...settings, data: dataSettings })} 
          />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <RegionalSettings 
            settings={settings.regional} 
            onSave={(regionalSettings) => handleSaveSettings({ ...settings, regional: regionalSettings })} 
          />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <AccessibilitySettings 
            settings={settings.accessibility} 
            onSave={(accessibilitySettings) => handleSaveSettings({ ...settings, accessibility: accessibilitySettings })} 
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
