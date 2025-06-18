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
} from "@mui/material";
import { Document } from "@store/slices/documentSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GetAppIcon from "@mui/icons-material/GetApp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
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
    if (onView) onView(document);
  };

  const handleDownload = () => {
    handleClose();
    if (onDownload) onDownload(document);
  };

  const handleEdit = () => {
    handleClose();
    if (onEdit) onEdit(document);
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete(document);
  };

  const getFileIcon = () => {
    if (!document.fileType)
      return <ArticleIcon fontSize="large" color="action" />;

    if (document.fileType.includes("pdf")) {
      return <PictureAsPdfIcon fontSize="large" color="error" />;
    } else if (
      document.fileType.includes("word") ||
      document.fileType.includes("doc")
    ) {
      return <DescriptionIcon fontSize="large" color="primary" />;
    } else {
      return <ArticleIcon fontSize="large" color="action" />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case "draft":
        return "default";
      case "published":
        return "success";
      case "archived":
        return "error";
      case "under_review":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
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
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Chip
          label={document.status.replace("_", " ")}
          color={getStatusColor() as any}
          size="small"
        />

        <IconButton
          aria-label="more"
          id={`document-menu-${document.id}`}
          aria-controls={open ? `document-menu-${document.id}` : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id={`document-menu-${document.id}`}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": `document-menu-${document.id}`,
          }}
        >
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View
          </MenuItem>
          <MenuItem onClick={handleDownload}>
            <GetAppIcon fontSize="small" sx={{ mr: 1 }} /> Download
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ mr: 2 }}>{getFileIcon()}</Box>
        <Box>
          <Typography variant="h6" noWrap title={document.title}>
            {document.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version {document.version} • {formatDate(document.updatedAt)}
          </Typography>
        </Box>
      </Box>

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
        {document.description || "No description provided."}
      </Typography>

      <Box sx={{ mt: "auto" }}>
        <Grid container spacing={1}>
          {document.tags &&
            document.tags.slice(0, 3).map((tag, index) => (
              <Grid item key={index}>
                <Chip label={tag} size="small" variant="outlined" />
              </Grid>
            ))}
          {document.tags && document.tags.length > 3 && (
            <Grid item>
              <Tooltip title={document.tags.slice(3).join(", ")}>
                <Chip
                  label={`+${document.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Category: {document.category}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={handleView}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={handleDownload}>
              <GetAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default DocumentCard;
