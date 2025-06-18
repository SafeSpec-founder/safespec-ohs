import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BuildIcon from "@mui/icons-material/Build";
import FolderIcon from "@mui/icons-material/Folder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import HistoryIcon from "@mui/icons-material/History";
import ReportIcon from "@mui/icons-material/Report";
import ErrorIcon from "@mui/icons-material/Error";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import "../styles/sidebar.css";

const drawerWidth = 240;

// Logical order: Dashboard, Core, Management, Safety, Reports, Advanced, Account, Support
const allLinks = [
  // --- Core ---
  { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { path: "/profile", label: "Profile", icon: <PersonIcon /> },
  { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
  // --- Management ---
  { path: "/users", label: "Users", icon: <GroupIcon />, roles: ["admin"] },
  {
    path: "/user-management",
    label: "User Management",
    icon: <GroupIcon />,
    roles: ["admin"],
  },
  { path: "/user-details", label: "User Details", icon: <PersonIcon /> },
  { path: "/user-form", label: "User Form", icon: <NoteAddIcon /> },
  { path: "/equipment", label: "Equipment", icon: <BuildIcon /> },
  { path: "/documents", label: "Documents", icon: <DescriptionIcon /> },
  {
    path: "/document-manager",
    label: "Document Manager",
    icon: <FolderIcon />,
  },
  // --- Safety ---
  { path: "/incidents", label: "Incidents", icon: <AssignmentIcon /> },
  { path: "/incident-form", label: "Incident Form", icon: <NoteAddIcon /> },
  {
    path: "/incident-details",
    label: "Incident Details",
    icon: <SearchIcon />,
  },
  {
    path: "/corrective-actions",
    label: "Corrective Actions",
    icon: <AssignmentTurnedInIcon />,
  },
  {
    path: "/risk-management",
    label: "Risk Management",
    icon: <SecurityIcon />,
  },
  {
    path: "/safety-procedures",
    label: "Safety Procedures",
    icon: <SchoolIcon />,
  },
  { path: "/safety-charts", label: "Safety Charts", icon: <BarChartIcon /> },
  {
    path: "/pending-approvals",
    label: "Pending Approvals",
    icon: <AssignmentIcon />,
  },
  { path: "/training", label: "Training Records", icon: <SchoolIcon /> },
  {
    path: "/permits",
    label: "Permit to Work",
    icon: <AssignmentTurnedInIcon />,
  },
  // --- Reports ---
  { path: "/reports", label: "Reports", icon: <BarChartIcon /> },
  { path: "/monthly-reports", label: "Monthly Reports", icon: <ListAltIcon /> },
  { path: "/weekly-reports", label: "Weekly Reports", icon: <ListAltIcon /> },
  {
    path: "/performance-metrics",
    label: "Performance Metrics",
    icon: <TimelineIcon />,
  },
  { path: "/login-history", label: "Login History", icon: <HistoryIcon /> },
  { path: "/report-creator", label: "Report Creator", icon: <ReportIcon /> },
  // --- Advanced ---
  {
    path: "/enhanced-dashboard",
    label: "Enhanced Dashboard",
    icon: <DashboardIcon />,
  },
  {
    path: "/enhanced-settings",
    label: "Enhanced Settings",
    icon: <SettingsApplicationsIcon />,
  },
  { path: "/automation", label: "Automations", icon: <SmartToyIcon /> },
  { path: "/ai-assistant", label: "AI Assistant", icon: <SupportAgentIcon /> },
  {
    path: "/notifications",
    label: "Notifications",
    icon: <NotificationsIcon />,
  },
  // --- Account/Other ---
  { path: "/register", label: "Register", icon: <PersonAddIcon /> },
  { path: "/reset-password", label: "Reset Password", icon: <VpnKeyIcon /> },
  { path: "/not-found", label: "Not Found", icon: <ErrorIcon /> },
  { path: "/help", label: "Help", icon: <HelpOutlineIcon /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { userRole, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  // Group links by logical sections for UI
  const sections = [
    {
      title: null,
      links: allLinks.slice(0, 3), // Dashboard, Profile, Settings
    },
    {
      title: "Management",
      links: allLinks.slice(3, 10), // Users, User Management, User Details, User Form, Equipment, Documents, Document Manager
    },
    {
      title: "Safety",
      links: allLinks.slice(10, 20), // Incidents, Incident Form, Incident Details, Corrective Actions, etc.
    },
    {
      title: "Reports",
      links: allLinks.slice(20, 26), // Reports, Monthly, Weekly, Performance, Login, Report Creator
    },
    {
      title: "Advanced",
      links: allLinks.slice(26, 31), // Enhanced Dashboard, Enhanced Settings, Automations, AI Assistant, Notifications
    },
    {
      title: "Account",
      links: allLinks.slice(31, 34), // Register, Reset Password, Not Found
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "#fff",
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", p: 2, pb: 1 }}>
        <Avatar
          src="/logo192.png"
          alt="SafeSpec"
          sx={{ width: 40, height: 40, mr: 1, bgcolor: "black" }}
        />
        <Typography variant="h6" fontWeight={700}>
          SafeSpec
        </Typography>
      </Box>
      <Divider />
      {sections.map(
        (section, idx) =>
          section.links.filter(
            (link) =>
              !link.roles || (userRole && link.roles.includes(userRole)),
          ).length > 0 && (
            <React.Fragment key={idx}>
              {section.title && (
                <Typography
                  variant="subtitle1"
                  sx={{ m: 2, mt: 3, mb: 1, fontWeight: 600 }}
                >
                  {section.title}
                </Typography>
              )}
              <List>
                {section.links
                  .filter(
                    (link) =>
                      !link.roles ||
                      (userRole && link.roles.includes(userRole)),
                  )
                  .map((link) => (
                    <ListItem
                      button
                      key={link.path}
                      component={Link}
                      to={link.path}
                      selected={location.pathname === link.path}
                    >
                      <ListItemIcon>{link.icon}</ListItemIcon>
                      <ListItemText primary={link.label} />
                    </ListItem>
                  ))}
              </List>
              <Divider />
            </React.Fragment>
          ),
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem
          button
          component={Link}
          to="/help"
          selected={location.pathname === "/help"}
        >
          <ListItemIcon>
            <HelpOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
