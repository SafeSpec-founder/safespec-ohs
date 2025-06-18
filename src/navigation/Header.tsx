import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useOffline } from "../contexts/OfflineContext";

// Import icons
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/header.css";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline } = useOffline();
  const navigate = useNavigate();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
    handleUserMenuClose();
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById("header-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      setSearchQuery("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: highContrast ? "black" : "primary.main",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="Open navigation menu"
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: "inherit",
            textDecoration: "none",
            flexGrow: 1,
            display: { xs: "none", sm: "block" },
          }}
        >
          SafeSpec OHS
        </Typography>

        {searchOpen ? (
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flexGrow: 1,
              display: "flex",
              bgcolor: "rgba(255, 255, 255, 0.15)",
              borderRadius: 1,
              px: 2,
            }}
          >
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search SafeSpec"
              className="header-search-input"
            />
            <IconButton
              color="inherit"
              onClick={handleSearchToggle}
              aria-label="Close search"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {!searchOpen && (
          <>
            <IconButton
              color="inherit"
              onClick={handleSearchToggle}
              aria-label="Open search"
            >
              <SearchIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              aria-label="View notifications"
              aria-haspopup="true"
              aria-controls={
                notificationsAnchor ? "notifications-menu" : undefined
              }
              aria-expanded={Boolean(notificationsAnchor)}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              edge="end"
              color="inherit"
              onClick={handleUserMenuOpen}
              aria-label="User account menu"
              aria-haspopup="true"
              aria-controls={userMenuAnchor ? "user-menu" : undefined}
              aria-expanded={Boolean(userMenuAnchor)}
            >
              {user?.photoURL ? (
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>

      {isOffline && (
        <Box
          sx={{
            bgcolor: "warning.main",
            color: "warning.contrastText",
            py: 0.5,
            px: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2">
            You are offline. Some features may be limited.
          </Typography>
        </Box>
      )}
    </AppBar>
  );
};

export default Header;
