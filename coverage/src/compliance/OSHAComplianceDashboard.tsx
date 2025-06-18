import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useOffline } from "../contexts/OfflineContext";
import { complianceService } from "../services/complianceService";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  complianceStatus?: "compliant" | "non-compliant" | "partial";
}

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "closed";
  location: string;
  dueDate: string;
  assignee?: string;
  identifiedDate?: string;
  correctiveAction?: string;
}

interface Inspection {
  id: string;
  title: string;
  location: string;
  date: string;
  inspector: string;
  status: "scheduled" | "in-progress" | "completed";
  scheduledDate?: string;
}

interface FilterOptions {
  status: string;
  severity: string;
  location: string;
}

const OSHAComplianceDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline, queueAction } = useOffline();

  const [locations, setLocations] = useState<Location[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    severity: "all",
    location: "all",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const locationsData = await complianceService.getLocations();
      const findingsData = await complianceService.getFindings();
      const inspectionsData = await complianceService.getInspections();

      setLocations(locationsData);
      setFindings(findingsData);
      setInspections(inspectionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Move loadData function declaration above its usage
  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = async (filters: any) => {
    setLoading(true);
    try {
      // Apply filters to the current view
      const filteredFindings =
        await complianceService.getFilteredFindings(filters);
      setFindings(filteredFindings);
      setFilterOptions(filters);
    } catch (error) {
      // Handle error with proper error boundary
    } finally {
      setLoading(false);
    }
  };

  const updateFindingStatus = async (
    findingId: string,
    newStatus: "open" | "in-progress" | "closed",
  ) => {
    try {
      // Convert status format between Finding status and ComplianceItem status
      let complianceStatus:
        | "compliant"
        | "in-progress"
        | "non-compliant"
        | "not-applicable";

      if (newStatus === "closed") {
        complianceStatus = "compliant";
      } else if (newStatus === "in-progress") {
        complianceStatus = "in-progress";
      } else {
        complianceStatus = "non-compliant";
      }

      await complianceService.updateFinding(findingId, { status: newStatus });
      const updatedFindings = findings.map((finding) =>
        finding.id === findingId ? { ...finding, status: newStatus } : finding,
      );
      setFindings(updatedFindings);
    } catch (error) {
      console.error("Error updating finding status:", error);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const handleExportDashboard = () => {
    // Export the dashboard data
    complianceService
      .exportDashboard(filterOptions)
      .then((blob) => {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        // Open or download the exported dashboard
        window.open(url, "_blank");
      })
      .catch((error: Error) => {
        // Handle error with proper error boundary
        console.error("Export dashboard error:", error);
      });
  };

  const handleScheduleInspection = () => {
    // Navigate to inspection scheduling page or open modal
    window.location.href = "/inspections/schedule";
  };

  const handleViewLocation = (locationId: string) => {
    // Navigate to location details page
    window.location.href = `/locations/${locationId}`;
  };

  const handleSaveFinding = () => {
    if (!selectedFinding) return;

    complianceService
      .updateFinding(selectedFinding.id, selectedFinding)
      .then(() => {
        // Update local state
        const updatedFindings = findings.map((finding) =>
          finding.id === selectedFinding.id ? selectedFinding : finding,
        );
        setFindings(updatedFindings);
        setSelectedFinding(null);
      })
      .catch((error) => {
        // Handle error with proper error boundary
      });
  };

  // Calculate compliance metrics
  const calculateComplianceRate = () => {
    if (findings.length === 0) return 100;

    const resolvedFindings = findings.filter(
      (finding) => finding.status === "closed",
    ).length;

    return Math.round((resolvedFindings / findings.length) * 100);
  };

  const calculateRiskLevel = () => {
    if (findings.length === 0) return "Low";

    const highSeverityCount = findings.filter(
      (finding) =>
        finding.severity === "high" || finding.severity === "critical",
    ).length;

    const highSeverityPercentage = (highSeverityCount / findings.length) * 100;

    if (highSeverityPercentage >= 30) return "High";
    if (highSeverityPercentage >= 10) return "Medium";
    return "Low";
  };

  const getNextInspectionDate = () => {
    if (inspections.length === 0) return "Not scheduled";

    const upcomingInspections = inspections
      .filter(
        (inspection) =>
          inspection.scheduledDate &&
          new Date(inspection.scheduledDate) > new Date(),
      )
      .sort(
        (a, b) =>
          (a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0) -
          (b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0),
      );

    if (upcomingInspections.length === 0) return "Not scheduled";

    return upcomingInspections[0].scheduledDate
      ? new Date(upcomingInspections[0].scheduledDate).toLocaleDateString()
      : "Not scheduled";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        OSHA Compliance Dashboard
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={refreshData}
            aria-label="Refresh compliance data"
          >
            Refresh Data
          </Button>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleExportDashboard}
            aria-label="Export compliance dashboard"
          >
            Export Dashboard
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleScheduleInspection}
            aria-label="Schedule new inspection"
          >
            Schedule Inspection
          </Button>
        </Box>
      </Box>

      {/* Compliance Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Compliance Rate
            </Typography>
            <Typography
              variant="h3"
              color={
                calculateComplianceRate() >= 80
                  ? "success.main"
                  : calculateComplianceRate() >= 60
                    ? "warning.main"
                    : "error.main"
              }
            >
              {calculateComplianceRate()}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Open Findings
            </Typography>
            <Typography
              variant="h3"
              color={
                findings.filter((f) => f.status === "open").length > 10
                  ? "error.main"
                  : findings.filter((f) => f.status === "open").length > 5
                    ? "warning.main"
                    : "success.main"
              }
            >
              {findings.filter((f) => f.status === "open").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Risk Level
            </Typography>
            <Typography
              variant="h3"
              color={
                calculateRiskLevel() === "High"
                  ? "error.main"
                  : calculateRiskLevel() === "Medium"
                    ? "warning.main"
                    : "success.main"
              }
            >
              {calculateRiskLevel()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Next Inspection
            </Typography>
            <Typography variant="h5">{getNextInspectionDate()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Locations Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Locations
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {locations.map((location) => (
              <Box
                key={location.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => handleViewLocation(location.id)}
              >
                <Typography variant="subtitle1">{location.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {location.address}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2">
                    Findings:{" "}
                    {findings.filter((f) => f.location === location.id).length}
                  </Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor:
                        location.complianceStatus === "compliant"
                          ? "#4caf50"
                          : location.complianceStatus === "non-compliant"
                            ? "#f44336"
                            : "#ff9800",
                      color: "white",
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {location.complianceStatus?.toUpperCase() || "UNKNOWN"}
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Findings Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Compliance Findings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Status"
                    value={filterOptions.status}
                    onChange={(e) =>
                      applyFilters({ ...filterOptions, status: e.target.value })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Severity"
                    value={filterOptions.severity}
                    onChange={(e) =>
                      applyFilters({
                        ...filterOptions,
                        severity: e.target.value,
                      })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Location"
                    value={filterOptions.location}
                    onChange={(e) =>
                      applyFilters({
                        ...filterOptions,
                        location: e.target.value,
                      })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="all">All Locations</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {findings.map((finding) => (
                <Box
                  key={finding.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    borderLeft: `4px solid ${
                      finding.severity === "critical"
                        ? "#d32f2f"
                        : finding.severity === "high"
                          ? "#f57c00"
                          : finding.severity === "medium"
                            ? "#fbc02d"
                            : "#388e3c"
                    }`,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedFinding(finding)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="subtitle1">{finding.title}</Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor:
                          finding.severity === "critical"
                            ? "#d32f2f"
                            : finding.severity === "high"
                              ? "#f57c00"
                              : finding.severity === "medium"
                                ? "#fbc02d"
                                : "#388e3c",
                        color: "white",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {finding.severity.toUpperCase()}
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Location:{" "}
                    {locations.find((l) => l.id === finding.location)?.name ||
                      "Unknown"}{" "}
                    | Identified:{" "}
                    {finding.identifiedDate
                      ? new Date(finding.identifiedDate).toLocaleDateString()
                      : "N/A"}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    {finding.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        Status:
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor:
                            finding.status === "open"
                              ? "#f57c00"
                              : finding.status === "in-progress"
                                ? "#2196f3"
                                : finding.status === "resolved"
                                  ? "#4caf50"
                                  : "#9e9e9e",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {finding.status.toUpperCase().replace("-", " ")}
                      </Box>
                    </Box>

                    <Box>
                      <select
                        value={finding.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateFindingStatus(
                            finding.id,
                            e.target.value as "open" | "in-progress" | "closed",
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: "4px", marginRight: "8px" }}
                        aria-label={`Update status for ${finding.title}`}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Selected Finding Details */}
      {selectedFinding && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Finding Details: {selectedFinding.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                value={selectedFinding.title}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    title: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Finding title"
              />

              <TextField
                label="Description"
                value={selectedFinding.description}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    description: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                aria-label="Finding description"
              />

              <TextField
                select
                label="Severity"
                value={selectedFinding.severity}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    severity: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Finding severity"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Status"
                value={selectedFinding.status}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    status: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Finding status"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </TextField>

              <TextField
                select
                label="Location"
                value={selectedFinding.location}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    location: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Finding location"
                SelectProps={{
                  native: true,
                }}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Identified Date"
                type="date"
                value={
                  selectedFinding.identifiedDate
                    ? new Date(selectedFinding.identifiedDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    identifiedDate: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                aria-label="Finding identified date"
              />

              <TextField
                label="Due Date"
                type="date"
                value={
                  selectedFinding.dueDate
                    ? new Date(selectedFinding.dueDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    dueDate: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                aria-label="Finding due date"
              />

              <TextField
                label="Corrective Action"
                value={selectedFinding.correctiveAction || ""}
                onChange={(e) =>
                  setSelectedFinding({
                    ...selectedFinding,
                    correctiveAction: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                aria-label="Finding corrective action"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setSelectedFinding(null)}
              sx={{ mr: 2 }}
              aria-label="Cancel editing finding"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveFinding}
              aria-label="Save finding changes"
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default OSHAComplianceDashboard;
