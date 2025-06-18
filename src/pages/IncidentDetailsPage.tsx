import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Container,
  Paper,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  Person,
  CalendarToday,
  LocationOn,
  Assignment,
  Comment,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "@contexts/NotificationContext";

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

const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        // Mock incident data
        const mockIncident = {
          id: id,
          title: "Slip and Fall in Warehouse",
          description:
            "Employee slipped on wet floor in warehouse section B-2. Minor injury to left ankle.",
          status: "under_investigation",
          severity: "medium",
          type: "injury",
          location: "Warehouse Section B-2",
          reportedBy: {
            id: "1",
            name: "John Smith",
            email: "john.smith@safespec.com",
            avatar: "",
          },
          reportedAt: new Date("2024-01-15T10:30:00"),
          incidentDate: new Date("2024-01-15T09:45:00"),
          involvedPersons: [
            {
              id: "2",
              name: "Jane Doe",
              role: "Warehouse Worker",
              injuryType: "Minor ankle sprain",
            },
          ],
          witnesses: [
            {
              id: "3",
              name: "Mike Johnson",
              role: "Supervisor",
              statement:
                "Saw the incident occur, floor was wet from recent cleaning.",
            },
          ],
          immediateActions: [
            "First aid provided",
            "Area cordoned off",
            "Wet floor signs placed",
            "Incident reported to supervisor",
          ],
          rootCause: "Inadequate floor drying after cleaning",
          correctiveActions: [
            {
              id: "1",
              description: "Implement proper floor drying procedures",
              assignedTo: "Maintenance Team",
              dueDate: new Date("2024-01-30"),
              status: "pending",
            },
            {
              id: "2",
              description: "Install additional wet floor warning signs",
              assignedTo: "Safety Officer",
              dueDate: new Date("2024-01-25"),
              status: "in_progress",
            },
          ],
          attachments: [
            {
              id: "1",
              name: "incident_photos.zip",
              type: "image/zip",
              size: "2.5 MB",
              uploadedAt: new Date("2024-01-15T11:00:00"),
            },
            {
              id: "2",
              name: "witness_statement.pdf",
              type: "application/pdf",
              size: "156 KB",
              uploadedAt: new Date("2024-01-15T14:30:00"),
            },
          ],
          comments: [
            {
              id: "1",
              author: "Safety Manager",
              content:
                "Investigation initiated. Reviewing cleaning procedures.",
              timestamp: new Date("2024-01-15T15:00:00"),
            },
            {
              id: "2",
              author: "HR Representative",
              content:
                "Employee medical evaluation completed. Return to work approved with restrictions.",
              timestamp: new Date("2024-01-16T09:00:00"),
            },
          ],
        };

        setIncident(mockIncident);
      } catch (error) {
        showError("Error", "Failed to load incident details");
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id, showError]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/incidents/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      try {
        // Mock delete
        showSuccess("Success", "Incident deleted successfully");
        navigate("/incidents");
      } catch (error) {
        showError("Error", "Failed to delete incident");
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "under_investigation":
        return "warning";
      case "pending":
        return "info";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography>Loading incident details...</Typography>
        </Box>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">Incident not found</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Incident Details
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Overview" />
                  <Tab label="Investigation" />
                  <Tab label="Actions" />
                  <Tab label="Attachments" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="h5" gutterBottom>
                  {incident.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {incident.description}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Involved Persons
                </Typography>
                <List>
                  {incident.involvedPersons.map((person: any) => (
                    <ListItem key={person.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={person.name}
                        secondary={`${person.role} - ${person.injuryType}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Immediate Actions Taken
                </Typography>
                <List>
                  {incident.immediateActions.map(
                    (action: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={action} />
                      </ListItem>
                    ),
                  )}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Root Cause Analysis
                </Typography>
                <Typography variant="body1" paragraph>
                  {incident.rootCause}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Witnesses
                </Typography>
                <List>
                  {incident.witnesses.map((witness: any) => (
                    <ListItem key={witness.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={witness.name}
                        secondary={`${witness.role} - ${witness.statement}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Comments
                </Typography>
                <List>
                  {incident.comments.map((comment: any) => (
                    <ListItem key={comment.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Comment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.content}
                        secondary={`${
                          comment.author
                        } - ${comment.timestamp.toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Corrective Actions
                </Typography>
                <List>
                  {incident.correctiveActions.map((action: any) => (
                    <ListItem key={action.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={action.description}
                        secondary={`Assigned to: ${
                          action.assignedTo
                        } | Due: ${action.dueDate.toLocaleDateString()} | Status: ${
                          action.status
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {incident.attachments.map((attachment: any) => (
                    <ListItem key={attachment.id}>
                      <ListItemText
                        primary={attachment.name}
                        secondary={`${attachment.type} - ${
                          attachment.size
                        } - Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incident Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={incident.status.replace("_", " ").toUpperCase()}
                    color={getStatusColor(incident.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    label={incident.severity.toUpperCase()}
                    color={getSeverityColor(incident.severity) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {incident.type.charAt(0).toUpperCase() +
                      incident.type.slice(1)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body1">{incident.location}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Incident Date
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body1">
                      {incident.incidentDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reported By
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" />
                    <Typography variant="body1">
                      {incident.reportedBy.name}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Reported At
                  </Typography>
                  <Typography variant="body1">
                    {incident.reportedAt.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default IncidentDetailsPage;
