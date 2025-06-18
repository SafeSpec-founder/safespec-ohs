import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useOffline } from "@contexts/OfflineContext";
import auditService from "@services/auditService";

const AuditDashboard: React.FC = () => {
  const { isOnline } = useOffline();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [audits, setAudits] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<any>({
    status: "all",
    type: "all",
    dateRange: "all",
  });

  const loadData = useCallback(async () => {
    try {
      const auditsData = await auditService.getAudits();
      const templatesData = await auditService.getTemplates();
      const findingsData = await auditService.getFindings();

      setAudits(auditsData);
      setTemplates(templatesData);
      setFindings(findingsData);
    } catch (error) {
      // Handle error with proper error boundary
      if (!isOnline) {
        // Use cached data if available
      }
    }
  }, [isOnline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilterOptions({
      ...filterOptions,
      [field]: value,
    });
  };

  const applyFilters = (items: any[], type: string) => {
    let filtered = [...items];

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (type === "audit") {
          return (
            item.id.toLowerCase().includes(searchLower) ||
            item.title.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower)
          );
        } else if (type === "template") {
          return (
            item.id.toLowerCase().includes(searchLower) ||
            item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
          );
        } else if (type === "finding") {
          return (
            item.id.toLowerCase().includes(searchLower) ||
            item.title.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    }

    // Apply status filter
    if (filterOptions.status !== "all") {
      filtered = filtered.filter(
        (item) => item.status === filterOptions.status,
      );
    }

    // Apply type filter
    if (filterOptions.type !== "all") {
      filtered = filtered.filter((item) => item.type === filterOptions.type);
    }

    // Apply date range filter
    if (filterOptions.dateRange !== "all") {
      const now = new Date();
      const startDate = new Date();

      if (filterOptions.dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (filterOptions.dateRange === "thisWeek") {
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day + (day === 0 ? -6 : 1)); // Adjust to Monday
        startDate.setHours(0, 0, 0, 0);
      } else if (filterOptions.dateRange === "thisMonth") {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      } else if (filterOptions.dateRange === "last30days") {
        startDate.setDate(startDate.getDate() - 30);
      } else if (filterOptions.dateRange === "last90days") {
        startDate.setDate(startDate.getDate() - 90);
      }

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= now;
      });
    }

    return filtered;
  };

  const filteredAudits = applyFilters(audits, "audit");
  const filteredTemplates = applyFilters(templates, "template");
  const filteredFindings = applyFilters(findings, "finding");

  const handleViewAudit = (id: string) => {
    // Navigate to audit details page
    window.location.href = `/audits/${id}`;
  };

  const handleEditAudit = (id: string) => {
    // Navigate to audit edit page
    window.location.href = `/audits/${id}/edit`;
  };

  const handleDeleteAudit = async (id: string) => {
    try {
      await auditService.deleteAudit(id);
      // Update local state
      setAudits(audits.filter((audit) => audit.id !== id));
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleViewTemplate = (id: string) => {
    // Navigate to template details page
    window.location.href = `/audit-templates/${id}`;
  };

  const handleEditTemplate = (id: string) => {
    // Navigate to template edit page
    window.location.href = `/audit-templates/${id}/edit`;
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await auditService.deleteTemplate(id);
      // Update local state
      setTemplates(templates.filter((template) => template.id !== id));
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleViewFinding = (id: string) => {
    // Navigate to finding details page
    window.location.href = `/audit-findings/${id}`;
  };

  const handleEditFinding = (id: string) => {
    // Navigate to finding edit page
    window.location.href = `/audit-findings/${id}/edit`;
  };

  const handleDeleteFinding = async (id: string) => {
    try {
      await auditService.deleteFinding(id);
      // Update local state
      setFindings(findings.filter((finding) => finding.id !== id));
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleCreateAudit = () => {
    // Navigate to create audit page
    window.location.href = "/audits/create";
  };

  const handleCreateTemplate = () => {
    // Navigate to create template page
    window.location.href = "/audit-templates/create";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Audit Dashboard
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {/* Search icon would go here */}
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
          inputProps={{
            "aria-label": "Search by ID, name, or finding",
          }}
        />

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={loadData}
            aria-label="Refresh audit data"
          >
            Refresh Data
          </Button>

          {activeTab === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAudit}
              aria-label="Create new audit"
            >
              Create Audit
            </Button>
          )}

          {activeTab === 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateTemplate}
              aria-label="Create new template"
            >
              Create Template
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Audit dashboard tabs"
            variant="fullWidth"
          >
            <Tab label="Audits" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Templates" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Findings" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={filterOptions.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type-select"
                  value={filterOptions.type}
                  label="Type"
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="external">External</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <InputLabel id="date-range-select-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-select-label"
                  id="date-range-select"
                  value={filterOptions.dateRange}
                  label="Date Range"
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="thisWeek">This Week</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="last30days">Last 30 Days</MenuItem>
                  <MenuItem value="last90days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Audits Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="tabpanel-0"
          aria-labelledby="tab-0"
          sx={{ p: 2 }}
        >
          {activeTab === 0 && (
            <TableContainer>
              <Table aria-label="Audits table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAudits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No audits found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>{audit.id}</TableCell>
                        <TableCell>{audit.title}</TableCell>
                        <TableCell>{audit.type}</TableCell>
                        <TableCell>{audit.location}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1,
                              py: 0.5,
                              bgcolor:
                                audit.status === "approved"
                                  ? "success.light"
                                  : audit.status === "rejected"
                                    ? "error.light"
                                    : audit.status === "completed"
                                      ? "info.light"
                                      : audit.status === "in-progress"
                                        ? "warning.light"
                                        : "grey.300",
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {audit.status.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewAudit(audit.id)}
                            aria-label={`View audit ${audit.title}`}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleEditAudit(audit.id)}
                            aria-label={`Edit audit ${audit.title}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAudit(audit.id)}
                            aria-label={`Delete audit ${audit.title}`}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Templates Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
          sx={{ p: 2 }}
        >
          {activeTab === 1 && (
            <TableContainer>
              <Table aria-label="Templates table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No templates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>{template.id}</TableCell>
                        <TableCell>{template.name}</TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>{template.itemCount}</TableCell>
                        <TableCell>
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewTemplate(template.id)}
                            aria-label={`View template ${template.name}`}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleEditTemplate(template.id)}
                            aria-label={`Edit template ${template.name}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTemplate(template.id)}
                            aria-label={`Delete template ${template.name}`}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Findings Tab */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id="tabpanel-2"
          aria-labelledby="tab-2"
          sx={{ p: 2 }}
        >
          {activeTab === 2 && (
            <TableContainer>
              <Table aria-label="Findings table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Audit</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFindings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No findings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFindings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{finding.id}</TableCell>
                        <TableCell>{finding.title}</TableCell>
                        <TableCell>{finding.auditTitle}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1,
                              py: 0.5,
                              bgcolor:
                                finding.severity === "critical"
                                  ? "error.main"
                                  : finding.severity === "high"
                                    ? "error.light"
                                    : finding.severity === "medium"
                                      ? "warning.main"
                                      : "success.light",
                              color: "white",
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {finding.severity.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1,
                              py: 0.5,
                              bgcolor:
                                finding.status === "resolved"
                                  ? "success.light"
                                  : finding.status === "in-progress"
                                    ? "warning.light"
                                    : finding.status === "open"
                                      ? "error.light"
                                      : "grey.300",
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {finding.status.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {finding.dueDate
                            ? new Date(finding.dueDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewFinding(finding.id)}
                            aria-label={`View finding ${finding.title}`}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleEditFinding(finding.id)}
                            aria-label={`Edit finding ${finding.title}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFinding(finding.id)}
                            aria-label={`Delete finding ${finding.title}`}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AuditDashboard;
