import React from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Incident } from "../../store/slices/incidentSlice";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CommentIcon from "@mui/icons-material/Comment";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
      id={`incident-tabpanel-${index}`}
      aria-labelledby={`incident-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `incident-tab-${index}`,
    "aria-controls": `incident-tabpanel-${index}`,
  };
}

interface IncidentDetailsProps {
  incident: Incident;
  onEdit?: () => void;
  onClose?: () => void;
  onAddCorrectiveAction?: () => void;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  onEdit,
  onClose,
  onAddCorrectiveAction,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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

  // Mock data for the tabs - in a real app, this would come from API calls
  const comments = [
    {
      id: "1",
      text: "Initial investigation started",
      author: "John Doe",
      timestamp: "2023-05-15T10:30:00Z",
    },
    {
      id: "2",
      text: "Found potential cause in equipment malfunction",
      author: "Jane Smith",
      timestamp: "2023-05-15T14:45:00Z",
    },
    {
      id: "3",
      text: "Maintenance team notified",
      author: "Robert Johnson",
      timestamp: "2023-05-16T09:15:00Z",
    },
  ];

  const attachments = [
    {
      id: "1",
      name: "Incident_Photo_1.jpg",
      type: "image/jpeg",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      timestamp: "2023-05-15T10:35:00Z",
    },
    {
      id: "2",
      name: "Equipment_Manual.pdf",
      type: "application/pdf",
      size: "1.8 MB",
      uploadedBy: "Jane Smith",
      timestamp: "2023-05-15T15:20:00Z",
    },
    {
      id: "3",
      name: "Maintenance_Report.docx",
      type: "application/docx",
      size: "0.9 MB",
      uploadedBy: "Robert Johnson",
      timestamp: "2023-05-16T09:30:00Z",
    },
  ];

  const correctiveActions = [
    {
      id: "1",
      title: "Replace faulty equipment",
      status: "completed",
      assignedTo: "Maintenance Team",
      dueDate: "2023-05-20T00:00:00Z",
    },
    {
      id: "2",
      title: "Update safety procedures",
      status: "in_progress",
      assignedTo: "Safety Officer",
      dueDate: "2023-05-25T00:00:00Z",
    },
    {
      id: "3",
      title: "Conduct staff training",
      status: "open",
      assignedTo: "HR Department",
      dueDate: "2023-06-01T00:00:00Z",
    },
  ];

  const history = [
    {
      action: "Incident reported",
      user: "John Doe",
      timestamp: "2023-05-15T10:30:00Z",
    },
    {
      action: "Status changed to investigating",
      user: "Jane Smith",
      timestamp: "2023-05-15T14:45:00Z",
    },
    {
      action: "Corrective action added",
      user: "Robert Johnson",
      timestamp: "2023-05-16T09:15:00Z",
    },
    {
      action: "Status changed to action required",
      user: "Jane Smith",
      timestamp: "2023-05-16T15:30:00Z",
    },
  ];

  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            {incident.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {onEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                Edit
              </Button>
            )}

            {incident.status !== "closed" && onClose && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={onClose}
              >
                Close Incident
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {incident.description}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={incident.status.replace("_", " ")}
                      color={getStatusColor() as any}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Severity
                  </Typography>
                  <Box>
                    <Chip
                      label={incident.severity}
                      color={getSeverityColor() as any}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(incident.date)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2">{incident.location}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Reported By
                  </Typography>
                  <Typography variant="body2">{incident.reportedBy}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body2">
                    {incident.assignedTo || "Unassigned"}
                  </Typography>
                </Grid>

                {incident.witnesses && incident.witnesses.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Witnesses
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {incident.witnesses.map((witness, index) => (
                        <Chip
                          key={index}
                          label={witness}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatTimeAgo(incident.createdAt)}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Last Updated: {formatTimeAgo(incident.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="incident tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label={`Corrective Actions (${correctiveActions.length})`}
            {...a11yProps(0)}
          />
          <Tab
            icon={<CommentIcon />}
            iconPosition="start"
            label={`Comments (${comments.length})`}
            {...a11yProps(1)}
          />
          <Tab
            icon={<AttachFileIcon />}
            iconPosition="start"
            label={`Attachments (${attachments.length})`}
            {...a11yProps(2)}
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="History"
            {...a11yProps(3)}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Corrective Actions</Typography>

          {onAddCorrectiveAction && (
            <Button
              variant="contained"
              color="primary"
              onClick={onAddCorrectiveAction}
            >
              Add Corrective Action
            </Button>
          )}
        </Box>

        {correctiveActions.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No corrective actions have been added yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {correctiveActions.map((action) => (
              <Grid item xs={12} key={action.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {action.title}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <Chip
                          label={action.status.replace("_", " ")}
                          color={
                            action.status === "completed"
                              ? "success"
                              : action.status === "in_progress"
                                ? "warning"
                                : "default"
                          }
                          size="small"
                        />

                        <Typography variant="body2" color="text.secondary">
                          Due: {formatDate(action.dueDate)}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Assigned to: {action.assignedTo}
                      </Typography>
                    </Box>

                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        {comments.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No comments have been added yet.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {comments.map((comment) => (
              <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Avatar>{comment.author.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle2">
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(comment.timestamp)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {comment.text}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6" gutterBottom>
          Attachments
        </Typography>

        {attachments.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No attachments have been added yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {attachments.map((attachment) => (
              <Grid item xs={12} sm={6} md={4} key={attachment.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <AttachFileIcon color="primary" />
                    <Typography variant="subtitle2" noWrap>
                      {attachment.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Type: {attachment.type}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Size: {attachment.size}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Uploaded by: {attachment.uploadedBy}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {formatTimeAgo(attachment.timestamp)}
                  </Typography>

                  <Button variant="text" size="small" sx={{ mt: 1 }} fullWidth>
                    Download
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h6" gutterBottom>
          History
        </Typography>

        <Box sx={{ position: "relative" }}>
          {history.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                mb: 3,
                position: "relative",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  left: "16px",
                  top: "24px",
                  height:
                    index === history.length - 1 ? 0 : "calc(100% + 16px)",
                  width: "2px",
                  backgroundColor: "divider",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                  zIndex: 1,
                }}
              >
                {item.user.charAt(0)}
              </Avatar>

              <Box sx={{ ml: 2 }}>
                <Typography variant="body2">{item.action}</Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  By {item.user} • {formatTimeAgo(item.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default IncidentDetails;
