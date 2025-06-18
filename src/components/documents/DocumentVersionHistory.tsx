import React from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Document } from "../../store/slices/documentSlice";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";
import HistoryIcon from "@mui/icons-material/History";
import RestoreIcon from "@mui/icons-material/Restore";
import { formatDistanceToNow } from "date-fns";

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
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `document-tab-${index}`,
    "aria-controls": `document-tabpanel-${index}`,
  };
}

interface DocumentVersionHistoryProps {
  document: Document;
  versions: Array<{
    id: string;
    version: number;
    updatedAt: string;
    updatedBy: string;
    comment?: string;
  }>;
  onRestoreVersion?: (versionId: string) => void;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  document,
  versions,
  onRestoreVersion,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <ArticleIcon fontSize="small" />;

    if (fileType.includes("pdf")) {
      return <PictureAsPdfIcon fontSize="small" color="error" />;
    } else if (fileType.includes("word") || fileType.includes("doc")) {
      return <DescriptionIcon fontSize="small" color="primary" />;
    } else {
      return <ArticleIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
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

  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="document tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<HistoryIcon />}
            label="Version History"
            {...a11yProps(0)}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Typography variant="h6" gutterBottom>
          Document Version History
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          This document has {versions.length} versions. The current version is{" "}
          {document.version}.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List sx={{ width: "100%" }}>
          {versions.map((version, index) => (
            <React.Fragment key={version.id}>
              <ListItem
                secondaryAction={
                  version.version !== document.version && onRestoreVersion ? (
                    <Tooltip title="Restore this version">
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => onRestoreVersion(version.id)}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Chip label="Current" color="primary" size="small" />
                  )
                }
              >
                <ListItemIcon>{getFileIcon(document.fileType)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1">
                        Version {version.version}
                      </Typography>
                      {index === 0 && (
                        <Chip label="Latest" color="success" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Updated by {version.updatedBy}
                      </Typography>
                      {" — "}
                      {formatDate(version.updatedAt)} (
                      {formatTimeAgo(version.updatedAt)})
                      {version.comment && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Comment: {version.comment}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < versions.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </TabPanel>
    </Paper>
  );
};

export default DocumentVersionHistory;
