import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Grid,
  LinearProgress,
} from "@mui/material";
import { Incident } from "@store/slices/incidentSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { formatDistanceToNow } from "date-fns";

interface IncidentCardProps {
  incident: Incident;
  onView?: (incident: Incident) => void;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
  onAssign?: (incident: Incident) => void;
  onClose?: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onClose,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    handleClose();
    if (onView) onView(incident);
  };

  const handleEdit = () => {
    handleClose();
    if (onEdit) onEdit(incident);
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete(incident);
  };

  const handleAssign = () => {
    handleClose();
    if (onAssign) onAssign(incident);
  };

  const handleCloseIncident = () => {
    handleClose();
    if (onClose) onClose(incident);
  };

  const getSeverityColor = () => {
    switch (incident.severity) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = () => {
    switch (incident.status) {
      case "draft":
        return "default";
      case "reported":
        return "info";
      case "investigating":
        return "warning";
      case "action_required":
        return "error";
      case "closed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusProgress = () => {
    switch (incident.status) {
      case "draft":
        return 20;
      case "reported":
        return 40;
      case "investigating":
        return 60;
      case "action_required":
        return 80;
      case "closed":
        return 100;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getSeverityIcon = () => {
    switch (incident.severity) {
      case "low":
        return <ReportProblemIcon color="success" />;
      case "medium":
        return <ReportProblemIcon color="warning" />;
      case "high":
        return <ReportProblemIcon color="error" />;
      case "critical":
        return (
          <ReportProblemIcon color="error" sx={{ transform: "scale(1.2)" }} />
        );
      default:
        return <ReportProblemIcon />;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        borderLeft: 4,
        borderColor: `${getSeverityColor()}.main`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={incident.severity}
            color={getSeverityColor() as any}
            size="small"
            icon={getSeverityIcon()}
          />
          <Chip
            label={incident.status.replace("_", " ")}
            color={getStatusColor() as any}
            size="small"
          />
        </Box>

        <IconButton
          aria-label="more"
          id={`incident-menu-${incident.id}`}
          aria-controls={open ? `incident-menu-${incident.id}` : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id={`incident-menu-${incident.id}`}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": `incident-menu-${incident.id}`,
          }}
        >
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleAssign}>
            <AssignmentIcon fontSize="small" sx={{ mr: 1 }} /> Assign
          </MenuItem>
          {incident.status !== "closed" && (
            <MenuItem onClick={handleCloseIncident}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Close Incident
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>

      <Typography variant="h6" gutterBottom noWrap title={incident.title}>
        {incident.title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          flex: 1,
        }}
      >
        {incident.description}
      </Typography>

      <Box sx={{ mt: "auto" }}>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Location: {incident.location}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Date: {new Date(incident.date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Reported by: {incident.reportedBy}
            </Typography>
          </Grid>
          {incident.assignedTo && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Assigned to: {incident.assignedTo}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ width: "100%", mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={getStatusProgress()}
            color={getStatusColor() as any}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Updated {formatDate(incident.updatedAt)}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={handleView}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={handleEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default IncidentCard;
