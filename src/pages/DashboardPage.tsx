import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { useAppSelector } from "../store/index";
import { selectIncidents } from "../store/slices/incidentSlice";
import { selectDocuments } from "../store/slices/documentSlice";
import { selectCorrectiveActions } from "../store/slices/correctiveActionSlice";
import IncidentStatusChart from "../components/charts/IncidentStatusChart";
import IncidentSeverityChart from "../components/charts/IncidentSeverityChart";
import CorrectiveActionStatusChart from "../components/charts/CorrectiveActionStatusChart";
import RecentIncidentsTable from "../components/dashboard/RecentIncidentsTable";
import UpcomingActionsTable from "../components/dashboard/UpcomingActionsTable";
import SafetyScoreCard from "../components/dashboard/SafetyScoreCard";
import AIChatInterface from "../components/ai/AIChatInterface";

const DashboardPage: React.FC = () => {
  const incidents = useAppSelector(selectIncidents);
  const documents = useAppSelector(selectDocuments);
  const correctiveActions = useAppSelector(selectCorrectiveActions);

  // Calculate some metrics for the dashboard
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(
    (inc) => inc.status !== "closed",
  ).length;
  const criticalIncidents = incidents.filter(
    (inc) => inc.severity === "critical",
  ).length;

  const totalDocuments = documents.length;
  const totalActions = correctiveActions.length;
  const overdueActions = correctiveActions.filter((action) => {
    return (
      new Date(action.dueDate) < new Date() && action.status !== "completed"
    );
  }).length;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Safety Score */}
        <Grid item xs={12} md={6} lg={3}>
          <SafetyScoreCard overallScore={85} />
        </Grid>

        {/* Incident Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Incidents
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Incidents
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {totalIncidents}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Open Incidents
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={openIncidents > 0 ? "warning.main" : "success.main"}
                >
                  {openIncidents}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Critical Incidents
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={criticalIncidents > 0 ? "error.main" : "success.main"}
                >
                  {criticalIncidents}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Document Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {totalDocuments}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Policies
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {documents.filter((doc) => doc.category === "policy").length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Procedures
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {
                    documents.filter((doc) => doc.category === "procedure")
                      .length
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Corrective Actions Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Corrective Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Actions
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {totalActions}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Open Actions
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={
                    correctiveActions.filter((a) => a.status === "open")
                      .length > 0
                      ? "warning.main"
                      : "success.main"
                  }
                >
                  {correctiveActions.filter((a) => a.status === "open").length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Overdue Actions
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={overdueActions > 0 ? "error.main" : "success.main"}
                >
                  {overdueActions}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Incident Status
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IncidentStatusChart />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Incident Severity
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IncidentSeverityChart />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Corrective Action Status
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CorrectiveActionStatusChart />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Incidents */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Incidents
            </Typography>
            <RecentIncidentsTable incidents={incidents.slice(0, 5) as any} />
          </Paper>
        </Grid>

        {/* Upcoming Actions */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Actions
            </Typography>
            <UpcomingActionsTable actions={correctiveActions.slice(0, 5) as any} />
          </Paper>
        </Grid>

        {/* AI Assistant */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Safety Assistant
            </Typography>
            <AIChatInterface placeholder="Ask me about safety regulations or for help with incident reporting..." />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
