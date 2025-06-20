import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/index";
import {
  selectNotifications,
  markAsRead,
  markAllAsRead,
} from "../store/slices/notificationSlice";
import NotificationCard from "../components/notifications/NotificationCard";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FilterListIcon from "@mui/icons-material/FilterList";

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
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `notifications-tab-${index}`,
    "aria-controls": `notifications-tabpanel-${index}`,
  };
}

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  // Filter notifications based on the selected tab
  const filteredNotifications = useMemo(() => {
    switch (value) {
      case 0: // All
        return notifications.notifications;
      case 1: // Unread
        return notifications.notifications.filter(
          (notification: any) => !notification.read,
        );
      case 2: // Read
        return notifications.notifications.filter(
          (notification: any) => notification.read,
        );
      default:
        return notifications.notifications;
    }
  }, [notifications, value]);

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
          Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={!notifications.notifications.some((notification) => !notification.read)}
          >
            Mark All as Read
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="notification tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${notifications.notifications.length})`} {...a11yProps(0)} />
            <Tab
              label={`Unread (${notifications.notifications.filter((notification) => !notification.read).length})`}
              {...a11yProps(1)}
            />
            <Tab
              label={`Incidents (${notifications.notifications.filter((notification) => notification.category === "incident").length})`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Tasks (${notifications.notifications.filter((notification) => notification.category === "reminder").length})`}
              {...a11yProps(3)}
            />
            <Tab
              label={`System (${notifications.notifications.filter((notification) => notification.category === "system").length})`}
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <NotificationsList notifications={filteredNotifications} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <NotificationsList notifications={filteredNotifications} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <NotificationsList notifications={filteredNotifications} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <NotificationsList notifications={filteredNotifications} />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <NotificationsList notifications={filteredNotifications} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface NotificationsListProps {
  notifications: any[];
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
}) => {
  const dispatch = useAppDispatch();

    const handleMarkAsRead = (id: string) => {
      dispatch(markAsRead(id));
    };

  if (notifications.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No notifications found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {notifications.map((notification) => (
          <Grid item xs={12} key={notification.id}>
            <NotificationCard
              {...notification}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NotificationsPage;
