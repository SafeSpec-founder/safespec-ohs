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
import { useAppSelector, useAppDispatch } from "../store/index";
import { selectReports, fetchReports } from "../store/slices/reportSlice";
import ReportCard from "../components/reports/ReportCard";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import TableChartIcon from "@mui/icons-material/TableChart";

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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `reports-tab-${index}`,
    "aria-controls": `reports-tabpanel-${index}`,
  };
}

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const reports = useAppSelector(selectReports);
  const [value, setValue] = useState(0);

  useEffect(() => {
    dispatch(fetchReports({}));
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleViewReport = (report: any) => {
    navigate(`/reports/${report.id}`);
  };

  const handleCreateReport = (type: string) => {
    navigate(`/reports/create/${type}`);
  };

  // Filter reports based on the selected tab
  const filteredReports = useMemo(() => {
    switch (value) {
      case 0: // All
        return reports.reports;
      case 1: // Incident Reports
        return reports.reports.filter(
          (report: any) => report.type === "incident",
        );
      case 2: // Compliance Reports
        return reports.reports.filter(
          (report: any) => report.type === "compliance",
        );
      case 3: // Safety Metrics
        return reports.reports.filter(
          (report: any) => report.type === "safety_metrics",
        );
      case 4: // Custom Reports
        return reports.reports.filter(
          (report: any) => report.type === "custom",
        );
      default:
        return reports.reports;
    }
  }, [reports, value]);

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
          Reports
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/reports/create")}
          >
            Create Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              borderRadius: 2,
            }}
            onClick={() => handleCreateReport("incident")}
          >
            <BarChartIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Incident Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate reports on incidents by type, severity, and status
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              borderRadius: 2,
            }}
            onClick={() => handleCreateReport("compliance")}
          >
            <PieChartIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Compliance Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track compliance with safety regulations and standards
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              borderRadius: 2,
            }}
            onClick={() => handleCreateReport("safety_metrics")}
          >
            <TimelineIcon sx={{ fontSize: 48, color: "info.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Safety Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyze key safety performance indicators over time
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              borderRadius: 2,
            }}
            onClick={() => handleCreateReport("custom")}
          >
            <TableChartIcon
              sx={{ fontSize: 48, color: "warning.main", mb: 1 }}
            />
            <Typography variant="h6" gutterBottom>
              Custom Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Build custom reports with flexible data selection
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="report tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`All Reports (${reports.reports.length})`}
              {...a11yProps(0)}
            />
            <Tab
              label={`Incident Reports (${reports.reports.filter((report: any) => report.type === "incident").length})`}
              {...a11yProps(1)}
            />
            <Tab
              label={`Compliance Reports (${reports.reports.filter((report: any) => report.type === "compliance").length})`}
              {...a11yProps(2)}
            />
            <Tab
              label={`Safety Metrics (${reports.reports.filter((report: any) => report.type === "safety_metrics").length})`}
              {...a11yProps(3)}
            />
            <Tab
              label={`Custom Reports (${reports.reports.filter((report: any) => report.type === "custom").length})`}
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <ReportsList reports={filteredReports} onView={handleViewReport} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ReportsList reports={filteredReports} onView={handleViewReport} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ReportsList reports={filteredReports} onView={handleViewReport} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ReportsList reports={filteredReports} onView={handleViewReport} />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <ReportsList reports={filteredReports} onView={handleViewReport} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

interface ReportsListProps {
  reports: any[];
  onView: (report: any) => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ reports, onView }) => {
  if (reports.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No reports found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {reports.map((report) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
          <ReportCard {...report} onView={() => onView(report)} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportsPage;
