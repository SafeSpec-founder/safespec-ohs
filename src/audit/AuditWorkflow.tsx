import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import auditService from "../services/auditService";
import { useAuth } from "../contexts/AuthContext";
import { useOffline } from "../contexts/OfflineContext";

const AuditWorkflow: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { isOffline, queueAction } = useOffline();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [audits, setAudits] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState<any>({
    status: "all",
    type: "all",
    dateRange: "all",
  });

  // Schedule audit dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState<boolean>(false);
  const [scheduleFormData, setScheduleFormData] = useState<any>({
    templateId: "",
    title: "",
    location: "",
    scheduledDate: "",
    assignedTo: "",
    notes: "",
  });

  // Approval dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      const auditsData = await auditService.getAudits();
      const templatesData = await auditService.getTemplates();
      setAudits(auditsData);
      setTemplates(templatesData);
      if (templatesData.length > 0) {
        setScheduleFormData((prev: any) => ({
          ...prev,
          templateId: templatesData[0].id,
        }));
      }
    } catch (error) {
      // Handle error with proper error boundary
      if (isOffline) {
        // Use cached data if available
      }
    }
  }, [isOffline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (field: string, value: string) => {
    const updatedFilters = {
      ...filterOptions,
      [field]: value,
    };

    setFilterOptions(updatedFilters);

    // Apply filters to API call
    applyFilters(updatedFilters);
  };

  const applyFilters = async (filters: any) => {
    try {
      // Apply filters to the audits list
      const filteredAudits = await auditService.getFilteredAudits(filters);
      setAudits(filteredAudits);
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleOpenScheduleDialog = () => {
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
  };

  const handleScheduleInputChange = (field: string, value: any) => {
    setScheduleFormData({
      ...scheduleFormData,
      [field]: value,
    });
  };

  const handleScheduleTemplateChange = (event: SelectChangeEvent) => {
    handleScheduleInputChange("templateId", event.target.value);
  };

  const handleScheduleAudit = async () => {
    try {
      const scheduleParams = {
        templateId: scheduleFormData.templateId,
        title: scheduleFormData.title,
        location: scheduleFormData.location,
        scheduledDate: scheduleFormData.scheduledDate,
        assignedTo: scheduleFormData.assignedTo,
        notes: scheduleFormData.notes,
      };
      if (isOffline) {
        queueAction({ type: "scheduleAudit", payload: scheduleParams });
        handleCloseScheduleDialog();
        return;
      }
      const newAudit = await auditService.scheduleAudit(scheduleParams);
      setAudits([newAudit, ...audits]);
      handleCloseScheduleDialog();
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleSelectAudit = async (audit: any) => {
    try {
      // Get full audit details
      const auditDetails = await auditService.getAuditDetails(audit.id);
      setSelectedAudit(auditDetails);
      setSelectedTemplate(null);
      setSelectedFinding(null);
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleSelectTemplate = async (template: any) => {
    try {
      // Get full template details
      const templateDetails = await auditService.getTemplateDetails(
        template.id,
      );
      setSelectedTemplate(templateDetails);
      setSelectedAudit(null);
      setSelectedFinding(null);
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleSelectFinding = (finding: any) => {
    setSelectedFinding(finding);
  };

  const handleUpdateFindingStatus = async (
    findingId: string,
    newStatus: string,
  ) => {
    try {
      if (isOffline) {
        queueAction({
          type: "updateFindingStatus",
          payload: { findingId, status: newStatus },
        });
        // Update UI optimistically
        if (selectedAudit) {
          const updatedFindings = selectedAudit.findings.map((finding: any) =>
            finding.id === findingId
              ? { ...finding, status: newStatus }
              : finding,
          );
          setSelectedAudit({
            ...selectedAudit,
            findings: updatedFindings,
          });
        }
        return;
      }

      await auditService.updateFindingStatus(findingId, newStatus);

      // Update local state
      if (selectedAudit) {
        const updatedFindings = selectedAudit.findings.map((finding: any) =>
          finding.id === findingId
            ? { ...finding, status: newStatus }
            : finding,
        );
        setSelectedAudit({
          ...selectedAudit,
          findings: updatedFindings,
        });
      }

      if (selectedFinding && selectedFinding.id === findingId) {
        setSelectedFinding({
          ...selectedFinding,
          status: newStatus,
        });
      }
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleCompleteAudit = async () => {
    try {
      if (!selectedAudit) return;

      if (isOffline) {
        queueAction({
          type: "completeAudit",
          payload: { auditId: selectedAudit.id },
        });
        // Update UI optimistically
        setSelectedAudit({
          ...selectedAudit,
          status: "completed",
          completedAt: new Date().toISOString(),
          completedBy: currentUser?.uid,
        });
        return;
      }

      const completionData = {
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.uid,
      };

      const updatedAudit = await auditService.completeAudit(
        selectedAudit.id,
        completionData,
      );

      // Update local state
      setSelectedAudit(updatedAudit);
      setAudits(
        audits.map((audit) =>
          audit.id === updatedAudit.id ? updatedAudit : audit,
        ),
      );
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleOpenApprovalDialog = (action: "approve" | "reject") => {
    setApprovalAction(action);
    setApprovalNotes("");
    setApprovalDialogOpen(true);
  };

  const handleCloseApprovalDialog = () => {
    setApprovalDialogOpen(false);
  };

  const handleApproveRejectAudit = async () => {
    try {
      if (!selectedAudit) return;

      if (isOffline) {
        queueAction({
          type: approvalAction === "approve" ? "approveAudit" : "rejectAudit",
          payload: {
            auditId: selectedAudit.id,
            notes: approvalNotes,
          },
        });
        // Update UI optimistically
        setSelectedAudit({
          ...selectedAudit,
          status: approvalAction === "approve" ? "approved" : "rejected",
          approvalNotes: approvalNotes,
          approvedRejectedAt: new Date().toISOString(),
          approvedRejectedBy: currentUser?.uid,
        });
        handleCloseApprovalDialog();
        return;
      }

      let updatedAudit: any;
      if (approvalAction === "approve") {
        updatedAudit = await auditService.approveAudit(selectedAudit.id, {
          notes: approvalNotes,
          approvedBy: currentUser?.uid,
        });
      } else {
        // For reject, we'll use a generic update method since rejectAudit doesn't exist
        updatedAudit = await auditService.updateAudit(selectedAudit.id, {
          status: "rejected",
          approvalNotes: approvalNotes,
          approvedRejectedAt: new Date().toISOString(),
          approvedRejectedBy: currentUser?.uid,
        });
      }

      // Update local state
      setSelectedAudit(updatedAudit);
      setAudits(
        audits.map((audit) =>
          audit.id === updatedAudit.id ? updatedAudit : audit,
        ),
      );

      handleCloseApprovalDialog();
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleUpdateAuditItem = async (
    itemId: string,
    response: string,
    notes: string,
  ) => {
    try {
      if (!selectedAudit) return;

      if (isOffline) {
        queueAction({
          type: "updateAuditItem",
          payload: {
            auditId: selectedAudit.id,
            itemId,
            response,
            notes,
          },
        });
        // Update UI optimistically
        const updatedItems = selectedAudit.items.map((item: any) =>
          item.id === itemId ? { ...item, response, notes } : item,
        );
        setSelectedAudit({
          ...selectedAudit,
          items: updatedItems,
        });
        return;
      }

      await auditService.updateAuditItem(itemId, { response, notes });

      // Update local state
      const updatedItems = selectedAudit.items.map((item: any) =>
        item.id === itemId ? { ...item, response, notes } : item,
      );
      setSelectedAudit({
        ...selectedAudit,
        items: updatedItems,
      });
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleAddFinding = async (itemId: string, finding: any) => {
    try {
      if (!selectedAudit) return;

      if (isOffline) {
        queueAction({
          type: "addFinding",
          payload: {
            auditId: selectedAudit.id,
            itemId,
            finding,
          },
        });
        // Update UI optimistically
        const newFinding = {
          id: `temp-${Date.now()}`,
          auditId: selectedAudit.id,
          itemId: itemId,
          ...finding,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.uid,
          status: "open",
        };
        setSelectedAudit({
          ...selectedAudit,
          findings: [...selectedAudit.findings, newFinding],
        });
        return;
      }

      // Use a generic method since addFinding doesn't exist
      const newFinding = await auditService.createFinding(selectedAudit.id, {
        itemId,
        ...finding,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid,
        status: "open",
      });

      // Update local state
      setSelectedAudit({
        ...selectedAudit,
        findings: [...selectedAudit.findings, newFinding],
      });
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const handleAddEvidence = async (itemId: string, evidence: any) => {
    try {
      if (!selectedAudit) return;

      if (isOffline) {
        queueAction({
          type: "addEvidence",
          payload: {
            auditId: selectedAudit.id,
            itemId,
            evidence,
          },
        });
        // Update UI optimistically
        const updatedItems = selectedAudit.items.map((item: any) =>
          item.id === itemId
            ? {
                ...item,
                evidence: [
                  ...(item.evidence || []),
                  {
                    id: `temp-${Date.now()}`,
                    ...evidence,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: currentUser?.uid,
                  },
                ],
              }
            : item,
        );
        setSelectedAudit({
          ...selectedAudit,
          items: updatedItems,
        });
        return;
      }

      // Use a generic method since addEvidence doesn't exist
      const updatedItem = await auditService.updateAuditItem(itemId, {
        evidence: [
          ...(selectedAudit.items.find((item: any) => item.id === itemId)
            ?.evidence || []),
          {
            ...evidence,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.uid,
          },
        ],
      });

      // Update local state
      const updatedItems = selectedAudit.items.map((item: any) =>
        item.id === itemId ? updatedItem : item,
      );
      setSelectedAudit({
        ...selectedAudit,
        items: updatedItems,
      });
    } catch (error) {
      // Handle error with proper error boundary
    }
  };

  const filteredAudits = audits.filter((audit) => {
    // Apply status filter
    if (
      filterOptions.status !== "all" &&
      audit.status !== filterOptions.status
    ) {
      return false;
    }

    // Apply type filter
    if (filterOptions.type !== "all" && audit.type !== filterOptions.type) {
      return false;
    }

    // Apply date range filter
    if (filterOptions.dateRange !== "all") {
      const auditDate = new Date(audit.createdAt);
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

      if (auditDate < startDate || auditDate > now) {
        return false;
      }
    }

    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Audit Workflow
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
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => loadData()}
            aria-label="Refresh audit data"
          >
            Refresh Data
          </Button>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleDialog}
            aria-label="Schedule new audit"
          >
            Schedule Audit
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Audits List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="Audit workflow tabs"
                variant="fullWidth"
              >
                <Tab label="Audits" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="Templates" id="tab-1" aria-controls="tabpanel-1" />
              </Tabs>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      id="status-filter"
                      value={filterOptions.status}
                      label="Status"
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
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
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    <InputLabel id="type-filter-label">Type</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      id="type-filter"
                      value={filterOptions.type}
                      label="Type"
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="internal">Internal</MenuItem>
                      <MenuItem value="external">External</MenuItem>
                      <MenuItem value="compliance">Compliance</MenuItem>
                      <MenuItem value="safety">Safety</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Audits/Templates List */}
            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              {activeTab === 0
                ? // Audits List
                  filteredAudits.map((audit) => (
                    <Paper
                      key={audit.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: "pointer",
                        backgroundColor:
                          selectedAudit?.id === audit.id
                            ? "action.selected"
                            : "background.paper",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      onClick={() => handleSelectAudit(audit)}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {audit.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {audit.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {audit.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date:{" "}
                        {new Date(
                          audit.scheduledDate || audit.createdAt,
                        ).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))
                : // Templates List
                  templates.map((template) => (
                    <Paper
                      key={template.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: "pointer",
                        backgroundColor:
                          selectedTemplate?.id === template.id
                            ? "action.selected"
                            : "background.paper",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {template.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Items: {template.items?.length || 0}
                      </Typography>
                    </Paper>
                  ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            {selectedAudit ? (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {selectedAudit.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedAudit.description}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedAudit.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedAudit.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedAudit.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Scheduled Date:</strong>{" "}
                      {new Date(
                        selectedAudit.scheduledDate,
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCompleteAudit}
                    disabled={selectedAudit.status === "completed"}
                    sx={{ mr: 2 }}
                  >
                    Complete Audit
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleOpenApprovalDialog("approve")}
                    disabled={selectedAudit.status !== "completed"}
                    sx={{ mr: 2 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleOpenApprovalDialog("reject")}
                    disabled={selectedAudit.status !== "completed"}
                  >
                    Reject
                  </Button>
                </Box>

                {/* Audit Items */}
                <Typography variant="h6" gutterBottom>
                  Audit Items
                </Typography>
                {selectedAudit.items?.map((item: any) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {item.description}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Response"
                          value={item.response || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateAuditItem(
                              item.id,
                              e.target.value,
                              item.notes || "",
                            )
                          }
                          fullWidth
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="compliant">Compliant</MenuItem>
                          <MenuItem value="non-compliant">
                            Non-Compliant
                          </MenuItem>
                          <MenuItem value="not-applicable">
                            Not Applicable
                          </MenuItem>
                          <MenuItem value="observation">Observation</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Notes"
                          value={item.notes || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateAuditItem(
                              item.id,
                              item.response || "",
                              e.target.value,
                            )
                          }
                          fullWidth
                          variant="outlined"
                          size="small"
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleAddFinding(item.id, {
                            title: "New Finding",
                            description: "",
                            severity: "medium",
                            category: "compliance",
                          })
                        }
                        sx={{ mr: 1 }}
                      >
                        Add Finding
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleAddEvidence(item.id, {
                            type: "photo",
                            description: "",
                            url: "",
                          })
                        }
                      >
                        Add Evidence
                      </Button>
                    </Box>
                  </Paper>
                ))}

                {/* Findings */}
                {selectedAudit.findings &&
                  selectedAudit.findings.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Findings
                      </Typography>
                      {selectedAudit.findings.map((finding: any) => (
                        <Paper key={finding.id} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {finding.title}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {finding.description}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Severity:</strong> {finding.severity}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong> {finding.status}
                          </Typography>

                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleUpdateFindingStatus(
                                  finding.id,
                                  "resolved",
                                )
                              }
                              disabled={finding.status === "resolved"}
                              sx={{ mr: 1 }}
                            >
                              Mark Resolved
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleSelectFinding(finding)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
              </Box>
            ) : selectedTemplate ? (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {selectedTemplate.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedTemplate.description}
                </Typography>

                <Typography variant="h6" gutterBottom>
                  Template Items
                </Typography>
                {selectedTemplate.items?.map((item: any, index: number) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2">{item.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {item.category}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Select an audit or template to view details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Schedule Audit Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={handleCloseScheduleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Audit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="template-label">Template</InputLabel>
                <Select
                  labelId="template-label"
                  id="template-select"
                  value={scheduleFormData.templateId}
                  onChange={handleScheduleTemplateChange}
                  label="Template"
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Title"
                value={scheduleFormData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleScheduleInputChange("title", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                value={scheduleFormData.location}
                onChange={(e) =>
                  handleScheduleInputChange("location", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Scheduled Date"
                type="datetime-local"
                value={scheduleFormData.scheduledDate}
                onChange={(e) =>
                  handleScheduleInputChange("scheduledDate", e.target.value)
                }
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Assigned To"
                value={scheduleFormData.assignedTo}
                onChange={(e) =>
                  handleScheduleInputChange("assignedTo", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={scheduleFormData.notes}
                onChange={(e) =>
                  handleScheduleInputChange("notes", e.target.value)
                }
                fullWidth
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
          <Button onClick={handleScheduleAudit} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={handleCloseApprovalDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === "approve" ? "Approve Audit" : "Reject Audit"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Notes"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalDialog}>Cancel</Button>
          <Button
            onClick={handleApproveRejectAudit}
            variant="contained"
            color={approvalAction === "approve" ? "success" : "error"}
          >
            {approvalAction === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditWorkflow;
