import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "@store/index";
import { selectIncidents, fetchIncidents } from "@store/slices/incidentSlice";
import IncidentCard from "@components/incidents/IncidentCard";
import IncidentForm from "@components/incidents/IncidentForm";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";

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
      id={`incidents-tabpanel-${index}`}
      aria-labelledby={`incidents-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `incidents-tab-${index}`,
    "aria-controls": `incidents-tabpanel-${index}`,
  };
}

const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const incidents = useAppSelector(selectIncidents);
  const [value, setValue] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleViewIncident = (incident: any) => {
    navigate(`/incidents/${incident.id}`);
  };

  const handleEditIncident = (incident: any) => {
    navigate(`/incidents/${incident.id}/edit`);
  };

  const handleDeleteIncident = (incident: any) => {
    // In a real app, this would dispatch a delete action
    console.log("Delete incident:", incident.id);
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    // In a real app, this would refresh the incidents list
    dispatch(fetchIncidents());
  };

  // Filter incidents based on the selected tab
  const filteredIncidents = React.useMemo(() => {
    switch (value) {
      case 0: // All
        return incidents;
      case 1: // Open
        return incidents.filter((inc) => inc.status !== "closed");
      case 2: // Critical
        return incidents.filter(
          (inc) => inc.severity === "critical" || inc.severity === "high",
        );
      case 3: // Closed
        return incidents.filter((inc) => inc.status === "closed");
      default:
        return incidents;
    }
  }, [incidents, value]);

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Incidents
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Report Incident"}
          </Button>
        </Box>
      </Box>

      {showForm && (
        <Box sx={{ mb: 4 }}>
          <IncidentForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="incident tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${incidents.length})`} {...a11yProps(0)} />
            <Tab
              label={`Open (${incidents.filter((inc) => inc.status !== "closed").length})`}
              {...a11yProps(1)}
            />
            <Tab
              label={`Critical (${incidents.filter((inc) => inc.severity === "critical" || inc.severity === "high").length})`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Closed (${incidents.filter((inc) => inc.status === "closed").length})`}
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <IncidentsList
            incidents={filteredIncidents}
            onView={handleViewIncident}
            onEdit={handleEditIncident}
            onDelete={handleDeleteIncident}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <IncidentsList
            incidents={filteredIncidents}
            onView={handleViewIncident}
            onEdit={handleEditIncident}
            onDelete={handleDeleteIncident}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <IncidentsList
            incidents={filteredIncidents}
            onView={handleViewIncident}
            onEdit={handleEditIncident}
            onDelete={handleDeleteIncident}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <IncidentsList
            incidents={filteredIncidents}
            onView={handleViewIncident}
            onEdit={handleEditIncident}
            onDelete={handleDeleteIncident}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface IncidentsListProps {
  incidents: any[];
  onView: (incident: any) => void;
  onEdit: (incident: any) => void;
  onDelete: (incident: any) => void;
}

const IncidentsList: React.FC<IncidentsListProps> = ({
  incidents,
  onView,
  onEdit,
  onDelete,
}) => {
  if (incidents.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No incidents found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {incidents.map((incident) => (
        <Grid item xs={12} sm={6} md={4} key={incident.id}>
          <IncidentCard
            incident={incident}
            onView={() => onView(incident)}
            onEdit={() => onEdit(incident)}
            onDelete={() => onDelete(incident)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default IncidentsPage;
