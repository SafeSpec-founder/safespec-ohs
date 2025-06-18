import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  overallCompliance: number;
  standardsCompliance: Array<{
    name: string;
    compliance: number;
    status: string;
  }>;
  findingsBySeverity: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  findingsByStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentFindings: Array<{
    id: string;
    standard: string;
    requirement: string;
    description: string;
    severity: string;
    status: string;
    dueDate: string;
  }>;
  upcomingAssessments: Array<{
    id: string;
    name: string;
    standard: string;
    scheduledDate: string;
    assignedTo: string;
  }>;
}

interface RootState {
  auth: {
    user: {
      firstName?: string;
    } | null;
  };
}

// Mock API service - will be replaced with actual API calls
const fetchComplianceData = async (): Promise<DashboardData> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        overallCompliance: 78,
        standardsCompliance: [
          { name: "OSHA 1910", compliance: 85, status: "compliant" },
          { name: "ISO 45001", compliance: 72, status: "partially-compliant" },
          { name: "NFPA 70E", compliance: 92, status: "compliant" },
          {
            name: "EPA Regulations",
            compliance: 65,
            status: "partially-compliant",
          },
          { name: "ANSI Z10", compliance: 58, status: "non-compliant" },
        ],
        findingsBySeverity: [
          { name: "Critical", value: 5, color: "#d32f2f" },
          { name: "High", value: 12, color: "#f57c00" },
          { name: "Medium", value: 28, color: "#fbc02d" },
          { name: "Low", value: 35, color: "#388e3c" },
        ],
        findingsByStatus: [
          { name: "Open", value: 23, color: "#d32f2f" },
          { name: "In Progress", value: 32, color: "#fbc02d" },
          { name: "Closed", value: 25, color: "#388e3c" },
        ],
        recentFindings: [
          {
            id: "F-001",
            standard: "OSHA 1910",
            requirement: "1910.132",
            description: "Missing PPE in chemical storage area",
            severity: "high",
            status: "open",
            dueDate: "2025-06-15",
          },
          {
            id: "F-002",
            standard: "ISO 45001",
            requirement: "8.1.2",
            description: "Inadequate hazard communication procedures",
            severity: "medium",
            status: "in-progress",
            dueDate: "2025-06-10",
          },
          {
            id: "F-003",
            standard: "NFPA 70E",
            requirement: "130.5",
            description: "Arc flash risk assessment not completed",
            severity: "critical",
            status: "open",
            dueDate: "2025-06-05",
          },
          {
            id: "F-004",
            standard: "EPA Regulations",
            requirement: "40 CFR 262.34",
            description: "Improper hazardous waste storage",
            severity: "high",
            status: "in-progress",
            dueDate: "2025-06-20",
          },
          {
            id: "F-005",
            standard: "ANSI Z10",
            requirement: "5.1.1",
            description: "Management review not conducted",
            severity: "low",
            status: "closed",
            dueDate: "2025-06-25",
          },
        ],
        upcomingAssessments: [
          {
            id: "A-001",
            name: "Quarterly OSHA Compliance Review",
            standard: "OSHA 1910",
            scheduledDate: "2025-06-15",
            assignedTo: "John Smith",
          },
          {
            id: "A-002",
            name: "Annual ISO 45001 Audit",
            standard: "ISO 45001",
            scheduledDate: "2025-07-10",
            assignedTo: "Sarah Johnson",
          },
          {
            id: "A-003",
            name: "Electrical Safety Assessment",
            standard: "NFPA 70E",
            scheduledDate: "2025-06-22",
            assignedTo: "Michael Brown",
          },
        ],
      });
    }, 1000);
  });
};

const ComplianceDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [tabValue, setTabValue] = useState<number>(0);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchComplianceData();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading compliance dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return theme.palette.error.main;
      case "high":
        return theme.palette.warning.dark;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return theme.palette.error.main;
      case "in-progress":
        return theme.palette.warning.main;
      case "closed":
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return theme.palette.success.main;
      case "partially-compliant":
        return theme.palette.warning.main;
      case "non-compliant":
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Typography variant="h6">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Compliance Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Welcome back, {user?.firstName || "User"}. Here's your compliance
        overview.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Overall Compliance Score */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Overall Compliance Score
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={dashboardData.overallCompliance}
                  size={160}
                  thickness={5}
                  sx={{
                    color:
                      dashboardData.overallCompliance >= 80
                        ? theme.palette.success.main
                        : dashboardData.overallCompliance >= 60
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    color="text.secondary"
                  >
                    {`${dashboardData.overallCompliance}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button variant="outlined" color="primary">
                View Details
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Findings by Severity */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Findings by Severity
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.findingsBySeverity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.findingsBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} findings`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Findings by Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Findings by Status
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.findingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.findingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} findings`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Standards Compliance */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Standards Compliance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.standardsCompliance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Compliance %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, "Compliance"]} />
                  <Legend />
                  <Bar
                    dataKey="compliance"
                    name="Compliance Score"
                    fill={theme.palette.primary.main}
                    barSize={40}
                  >
                    {dashboardData.standardsCompliance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getComplianceStatusColor(entry.status)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs for Recent Findings and Upcoming Assessments */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="compliance tabs"
            >
              <Tab label="Recent Findings" />
              <Tab label="Upcoming Assessments" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {/* Recent Findings Tab */}
            {tabValue === 0 && (
              <TableContainer>
                <Table aria-label="recent findings table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Standard</TableCell>
                      <TableCell>Requirement</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentFindings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{finding.id}</TableCell>
                        <TableCell>{finding.standard}</TableCell>
                        <TableCell>{finding.requirement}</TableCell>
                        <TableCell>{finding.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={finding.severity.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getSeverityColor(finding.severity),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={finding.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(finding.status),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(finding.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Upcoming Assessments Tab */}
            {tabValue === 1 && (
              <TableContainer>
                <Table aria-label="upcoming assessments table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Standard</TableCell>
                      <TableCell>Scheduled Date</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.upcomingAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.id}</TableCell>
                        <TableCell>{assessment.name}</TableCell>
                        <TableCell>{assessment.standard}</TableCell>
                        <TableCell>
                          {new Date(
                            assessment.scheduledDate,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{assessment.assignedTo}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                          >
                            Start
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceDashboard;
