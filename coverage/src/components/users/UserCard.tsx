import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Email,
  Phone,
  LocationOn,
  Business,
  Schedule,
  Person,
  Security,
} from "@mui/icons-material";
import { format } from "date-fns";

interface UserCardProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role:
    | "admin"
    | "manager"
    | "supervisor"
    | "employee"
    | "contractor"
    | "viewer";
  department: string;
  position: string;
  phone?: string;
  location: string;
  status: "active" | "inactive" | "suspended" | "pending";
  lastLogin?: string;
  createdAt: string;
  certifications: Array<{
    id: string;
    name: string;
    status: "valid" | "expired" | "pending" | "revoked";
    expiryDate: string;
  }>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onActivate?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  compact?: boolean;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "error";
    case "manager":
      return "warning";
    case "supervisor":
      return "info";
    case "employee":
      return "success";
    case "contractor":
      return "secondary";
    case "viewer":
      return "default";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "default";
    case "suspended":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle color="success" />;
    case "suspended":
      return <Block color="error" />;
    case "pending":
      return <Schedule color="warning" />;
    default:
      return null;
  }
};

const UserCard: React.FC<UserCardProps> = ({
  id,
  email,
  firstName,
  lastName,
  displayName,
  avatar,
  role,
  department,
  position,
  phone,
  location,
  status,
  lastLogin,
  createdAt,
  certifications,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onViewDetails,
  compact = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id);
    handleMenuClose();
  };

  const handleSuspend = () => {
    if (onSuspend) onSuspend(id);
    handleMenuClose();
  };

  const handleActivate = () => {
    if (onActivate) onActivate(id);
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (onViewDetails) onViewDetails(id);
    handleMenuClose();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validCertifications = certifications.filter(
    (cert) => cert.status === "valid",
  ).length;
  const expiredCertifications = certifications.filter(
    (cert) => cert.status === "expired",
  ).length;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: 1,
        borderColor: status === "active" ? "success.light" : "divider",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: compact ? 2 : 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={getStatusIcon(status)}
            >
              <Avatar
                src={avatar}
                sx={{
                  width: compact ? 40 : 56,
                  height: compact ? 40 : 56,
                  bgcolor: getRoleColor(role) + ".main",
                }}
              >
                {!avatar && getInitials(firstName, lastName)}
              </Avatar>
            </Badge>
            <Box>
              <Typography
                variant={compact ? "body1" : "h6"}
                component="h3"
                fontWeight="bold"
              >
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {firstName} {lastName}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Chip
                  label={role}
                  color={getRoleColor(role) as any}
                  size="small"
                />
                <Chip
                  label={status}
                  color={getStatusColor(status) as any}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Email fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          </Box>
          {phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Phone fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {phone}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocationOn fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </Box>
        </Box>

        {/* Work Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Business fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {department}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Person fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {position}
            </Typography>
          </Box>
        </Box>

        {/* Certifications */}
        {certifications.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Certifications
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`${validCertifications} Valid`}
                color="success"
                size="small"
                variant="outlined"
              />
              {expiredCertifications > 0 && (
                <Chip
                  label={`${expiredCertifications} Expired`}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Metadata */}
        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Joined: {format(new Date(createdAt), "MMM dd, yyyy")}
            </Typography>
            {lastLogin && (
              <Typography variant="caption" color="text.secondary">
                Last login: {format(new Date(lastLogin), "MMM dd, yyyy")}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: compact ? 1 : 2, pt: 0 }}>
        <Button size="small" startIcon={<Person />} onClick={handleViewDetails}>
          View
        </Button>
        <Button size="small" startIcon={<Edit />} onClick={handleEdit}>
          Edit
        </Button>
        {status === "active" ? (
          <Button
            size="small"
            startIcon={<Block />}
            onClick={handleSuspend}
            color="warning"
          >
            Suspend
          </Button>
        ) : (
          <Button
            size="small"
            startIcon={<CheckCircle />}
            onClick={handleActivate}
            color="success"
          >
            Activate
          </Button>
        )}
      </CardActions>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem>
          <Security fontSize="small" sx={{ mr: 1 }} />
          Manage Permissions
        </MenuItem>
        <Divider />
        {status === "active" ? (
          <MenuItem onClick={handleSuspend} sx={{ color: "warning.main" }}>
            <Block fontSize="small" sx={{ mr: 1 }} />
            Suspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivate} sx={{ color: "success.main" }}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
            Activate User
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default UserCard;
