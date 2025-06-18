import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  MoreVert,
  Download,
  Share,
  Edit,
  Delete,
  Visibility,
  Schedule,
  Person,
  Assessment,
  FilePresent,
} from "@mui/icons-material";
import { format } from "date-fns";

interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  type:
    | "incident"
    | "audit"
    | "compliance"
    | "safety"
    | "performance"
    | "custom";
  status: "draft" | "pending" | "approved" | "published" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags: string[];
  attachments: string[];
  visibility: "private" | "internal" | "public";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  compact?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "incident":
      return <Assessment color="error" />;
    case "audit":
      return <Assessment color="primary" />;
    case "compliance":
      return <Assessment color="info" />;
    case "safety":
      return <Assessment color="warning" />;
    case "performance":
      return <Assessment color="success" />;
    case "custom":
      return <FilePresent color="secondary" />;
    default:
      return <Assessment />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "incident":
      return "#f44336";
    case "audit":
      return "#2196f3";
    case "compliance":
      return "#00bcd4";
    case "safety":
      return "#ff9800";
    case "performance":
      return "#4caf50";
    case "custom":
      return "#9c27b0";
    default:
      return "#757575";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "default";
    case "pending":
      return "warning";
    case "approved":
      return "info";
    case "published":
      return "success";
    case "archived":
      return "secondary";
    default:
      return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
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

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case "public":
      return "🌐";
    case "internal":
      return "🏢";
    case "private":
      return "🔒";
    default:
      return "🔒";
  }
};

const ReportCard: React.FC<ReportCardProps> = ({
  id,
  title,
  description,
  type,
  status,
  priority,
  createdBy,
  createdAt,
  updatedAt,
  publishedAt,
  tags,
  attachments,
  visibility,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
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

  const handleView = () => {
    if (onView) onView(id);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id);
    handleMenuClose();
  };

  const handleDownload = () => {
    if (onDownload) onDownload(id);
    handleMenuClose();
  };

  const handleShare = () => {
    if (onShare) onShare(id);
    handleMenuClose();
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: 1,
        borderColor: "divider",
        "&:hover": {
          boxShadow: 2,
          borderColor: getTypeColor(type),
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getTypeIcon(type)}
            <Box>
              <Typography
                variant={compact ? "body2" : "h6"}
                component="h3"
                fontWeight="bold"
              >
                {title}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Chip
                  label={type}
                  size="small"
                  sx={{
                    backgroundColor: getTypeColor(type),
                    color: "white",
                    fontSize: "0.7rem",
                  }}
                />
                <Typography variant="caption">
                  {getVisibilityIcon(visibility)} {visibility}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Status and Priority */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            label={status}
            color={getStatusColor(status) as any}
            size="small"
          />
          <Chip
            label={priority}
            color={getPriorityColor(priority) as any}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {tags.slice(0, compact ? 2 : 4).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              ))}
              {tags.length > (compact ? 2 : 4) && (
                <Chip
                  label={`+${tags.length - (compact ? 2 : 4)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
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
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Person fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {createdBy}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Schedule fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(createdAt), "MMM dd, yyyy")}
              </Typography>
            </Box>
          </Box>
          {publishedAt && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ display: "block", mt: 0.5 }}
            >
              Published: {format(new Date(publishedAt), "MMM dd, yyyy")}
            </Typography>
          )}
          {attachments.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              📎 {attachments.length} attachment
              {attachments.length > 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: compact ? 1 : 2, pt: 0 }}>
        <Button size="small" startIcon={<Visibility />} onClick={handleView}>
          View
        </Button>
        {status !== "archived" && (
          <Button size="small" startIcon={<Edit />} onClick={handleEdit}>
            Edit
          </Button>
        )}
        <Button size="small" startIcon={<Download />} onClick={handleDownload}>
          Download
        </Button>
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
        <MenuItem onClick={handleView}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Report
        </MenuItem>
        {status !== "archived" && (
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Report
          </MenuItem>
        )}
        <MenuItem onClick={handleDownload}>
          <Download fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ReportCard;
