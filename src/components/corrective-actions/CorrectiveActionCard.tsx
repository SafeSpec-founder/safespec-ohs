import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CorrectiveAction } from "../../store/slices/correctiveActionSlice";
import { formatDistanceToNow } from "date-fns";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import VerifiedIcon from "@mui/icons-material/Verified";

interface CorrectiveActionCardProps {
  correctiveAction: CorrectiveAction;
  onEdit?: (correctiveAction: CorrectiveAction) => void;
  onDelete?: (correctiveAction: CorrectiveAction) => void;
  onComplete?: (correctiveAction: CorrectiveAction) => void;
  onVerify?: (correctiveAction: CorrectiveAction) => void;
}

const CorrectiveActionCard: React.FC<CorrectiveActionCardProps> = ({
  correctiveAction,
  onEdit,
  onDelete,
  onComplete,
  onVerify,
}) => {
  const getPriorityColor = () => {
    switch (correctiveAction.priority) {
      case "low":
        return "success";
      case "medium":
        return "info";
      case "high":
        return "warning";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = () => {
    switch (correctiveAction.status) {
      case "open":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "overdue":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = () => {
    switch (correctiveAction.status) {
      case "open":
        return <PendingIcon fontSize="small" />;
      case "in_progress":
        return <PendingIcon fontSize="small" />;
      case "completed":
        return <CheckCircleIcon fontSize="small" />;
      case "overdue":
        return <WarningIcon fontSize="small" />;
      case "cancelled":
        return <PendingIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const isOverdue = () => {
    try {
      return (
        new Date(correctiveAction.dueDate) < new Date() &&
        correctiveAction.status !== "completed"
      );
    } catch (error) {
      return false;
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
        borderColor: isOverdue() ? "error.main" : `${getPriorityColor()}.main`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={correctiveAction.priority}
            color={getPriorityColor() as any}
            size="small"
          />
          <Chip
            label={correctiveAction.status.replace("_", " ")}
            color={getStatusColor() as any}
            size="small"
            icon={getStatusIcon()}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {correctiveAction.status !== "completed" &&
            correctiveAction.status !== "cancelled" && (
              <Tooltip title="Mark as Complete">
                <IconButton
                  size="small"
                  onClick={() => onComplete?.(correctiveAction)}
                >
                  <AssignmentTurnedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

          {correctiveAction.status === "completed" &&
            !correctiveAction.verifiedBy && (
              <Tooltip title="Verify Completion">
                <IconButton
                  size="small"
                  onClick={() => onVerify?.(correctiveAction)}
                >
                  <VerifiedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit?.(correctiveAction)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete?.(correctiveAction)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography
        variant="h6"
        gutterBottom
        noWrap
        title={correctiveAction.title}
      >
        {correctiveAction.title}
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
        {correctiveAction.description}
      </Typography>

      <Box sx={{ mt: "auto" }}>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Assigned to:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {correctiveAction.assignedTo}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Due date:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              color={isOverdue() ? "error.main" : "text.primary"}
            >
              {formatDate(correctiveAction.dueDate)}
              {isOverdue() && " (Overdue)"}
            </Typography>
          </Grid>

          {correctiveAction.relatedIncidentId && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Related incident: {correctiveAction.relatedIncidentId}
              </Typography>
            </Grid>
          )}

          {correctiveAction.completedDate && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Completed: {formatDate(correctiveAction.completedDate)} by{" "}
                {correctiveAction.completedBy}
              </Typography>
            </Grid>
          )}

          {correctiveAction.verificationDate && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Verified: {formatDate(correctiveAction.verificationDate)} by{" "}
                {correctiveAction.verifiedBy}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Created {formatTimeAgo(correctiveAction.createdAt)}
          </Typography>

          {correctiveAction.status === "completed" ? (
            <Chip
              label="Completed"
              color="success"
              size="small"
              icon={<CheckCircleIcon />}
            />
          ) : (
            <Button
              size="small"
              variant="outlined"
              color={isOverdue() ? "error" : "primary"}
              onClick={() => onComplete?.(correctiveAction)}
            >
              {isOverdue() ? "Overdue" : "Complete"}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CorrectiveActionCard;
