import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";
import {
  Close,
  Info,
  Warning,
  Error,
  CheckCircle,
  Schedule,
  OpenInNew,
  MarkEmailRead,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  category:
    | "system"
    | "safety"
    | "compliance"
    | "incident"
    | "audit"
    | "reminder";
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAction?: (id: string, actionUrl?: string) => void;
  compact?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "info":
      return <Info color="info" />;
    case "success":
      return <CheckCircle color="success" />;
    case "warning":
      return <Warning color="warning" />;
    case "error":
      return <Error color="error" />;
    default:
      return <Info color="info" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "info":
      return "info.light";
    case "success":
      return "success.light";
    case "warning":
      return "warning.light";
    case "error":
      return "error.light";
    default:
      return "info.light";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
      return "success";
    default:
      return "default";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "system":
      return "#757575";
    case "safety":
      return "#f44336";
    case "compliance":
      return "#2196f3";
    case "incident":
      return "#ff9800";
    case "audit":
      return "#9c27b0";
    case "reminder":
      return "#4caf50";
    default:
      return "#757575";
  }
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  title,
  message,
  type,
  priority,
  read,
  createdAt,
  expiresAt,
  actionUrl,
  actionText,
  category,
  onMarkAsRead,
  onDismiss,
  onAction,
  compact = false,
}) => {
  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction(id, actionUrl);
    }
  };

  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card
      sx={{
        mb: 1,
        border: 1,
        borderColor: read ? "divider" : getTypeColor(type),
        backgroundColor: read ? "background.paper" : `${getTypeColor(type)}08`,
        opacity: isExpired ? 0.6 : 1,
      }}
    >
      <CardContent
        sx={{ p: compact ? 2 : 3, "&:last-child": { pb: compact ? 2 : 3 } }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Icon */}
          <Avatar
            sx={{
              width: compact ? 32 : 40,
              height: compact ? 32 : 40,
              backgroundColor: getTypeColor(type),
            }}
          >
            {getTypeIcon(type)}
          </Avatar>

          {/* Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant={compact ? "body2" : "subtitle1"}
                  fontWeight={read ? "normal" : "bold"}
                  sx={{ color: read ? "text.secondary" : "text.primary" }}
                >
                  {title}
                </Typography>
                <Chip
                  label={priority}
                  size="small"
                  color={getPriorityColor(priority) as any}
                  variant="outlined"
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: getCategoryColor(category),
                  }}
                  title={category}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {!read && (
                  <IconButton
                    size="small"
                    onClick={handleMarkAsRead}
                    title="Mark as read"
                  >
                    <MarkEmailRead fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={handleDismiss}
                  title="Dismiss"
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: compact ? 1 : 2,
                display: "-webkit-box",
                WebkitLineClamp: compact ? 2 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {message}
            </Typography>

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Schedule fontSize="small" color="disabled" />
                  <Typography variant="caption" color="text.disabled">
                    {timeAgo}
                  </Typography>
                </Box>
                {expiresAt && (
                  <Typography
                    variant="caption"
                    color={isExpired ? "error" : "text.disabled"}
                  >
                    {isExpired
                      ? "Expired"
                      : `Expires ${format(
                          new Date(expiresAt),
                          "MMM dd, yyyy",
                        )}`}
                  </Typography>
                )}
              </Box>

              {/* Action Button */}
              {actionText && actionUrl && !isExpired && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNew fontSize="small" />}
                  onClick={handleAction}
                  sx={{ minWidth: "auto" }}
                >
                  {actionText}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
