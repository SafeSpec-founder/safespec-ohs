import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useOffline } from "../contexts/OfflineContext";
import { automationService } from "../services/automationService";
import ActionBuilder from "./ActionBuilder";

interface Rule {
  id: string;
  name: string; // Ensure `name` is required
  description: string; // Ensure `description` is required
  trigger: {
    type: "event" | "schedule" | "condition";
    config: any;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  status: "active" | "inactive" | "error";
}

const AutomationDashboard: React.FC = () => {
  const { isOffline, queueAction } = useOffline();

  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const rulesData = await automationService.getRules();
      setRules(rulesData);
    } catch (err) {
      setError("Failed to load automation rules. Please try again.");
      console.error("Error loading rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule);
    setShowRuleBuilder(true);
  };

  const handleCloseRuleBuilder = () => {
    setShowRuleBuilder(false);
  };

  const handleSaveRule = async (ruleData: Partial<Rule>) => {
    setLoading(true);
    try {
      if (isOffline) {
        queueAction({
          type: "saveRule",
          payload: { ruleId: selectedRule?.id, ruleData },
        }); // Fixed argument structure
        // Optimistically update UI
        if (selectedRule) {
          const updatedRules = rules.map((rule) =>
            rule.id === selectedRule.id
              ? { ...rule, ...ruleData, updatedAt: new Date() }
              : rule,
          );
          setRules(updatedRules);
        } else {
          const newRule: Rule = {
            id: `temp-${Date.now()}`,
            name: ruleData.name || "Unnamed Rule",
            description: ruleData.description || "No description",
            ...ruleData,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "active",
            enabled: true,
            trigger: { type: "event", config: {} },
            actions: [],
          };
          setRules([...rules, newRule]);
        }
        setShowRuleBuilder(false);
        return;
      }

      let savedRule: Rule;
      if (selectedRule) {
        savedRule = await automationService.updateRule(
          selectedRule.id,
          ruleData,
        );
        const updatedRules = rules.map((rule) =>
          rule.id === savedRule.id ? savedRule : rule,
        );
        setRules(updatedRules);
      } else {
        savedRule = await automationService.createRule(ruleData);
        setRules([...rules, savedRule]);
      }
      setShowRuleBuilder(false);
    } catch (err) {
      setError("Failed to save rule. Please try again.");
      console.error("Error saving rule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRuleStatus = async (ruleId: string, enabled: boolean) => {
    try {
      if (isOffline) {
        queueAction({
          type: "toggleRuleStatus",
          payload: { ruleId, enabled },
        }); // Fixed argument structure
        // Optimistically update UI
        const updatedRules = rules.map((rule) =>
          rule.id === ruleId
            ? { ...rule, enabled, updatedAt: new Date() }
            : rule,
        );
        setRules(updatedRules);
        return;
      }

      await automationService.updateRule(ruleId, { enabled });
      const updatedRules = rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled, updatedAt: new Date() } : rule,
      );
      setRules(updatedRules);
    } catch (err) {
      setError(
        `Failed to ${enabled ? "enable" : "disable"} rule. Please try again.`,
      );
      console.error("Error toggling rule status:", err);
    }
  };

  const handleOpenDeleteConfirm = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setConfirmDeleteOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setRuleToDelete(null);
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;

    try {
      if (isOffline) {
        queueAction({
          type: "deleteRule",
          payload: { ruleId: ruleToDelete },
        }); // Fixed argument structure
        // Optimistically update UI
        const updatedRules = rules.filter((rule) => rule.id !== ruleToDelete);
        setRules(updatedRules);
        handleCloseDeleteConfirm();
        return;
      }

      await automationService.deleteRule(ruleToDelete);
      const updatedRules = rules.filter((rule) => rule.id !== ruleToDelete);
      setRules(updatedRules);
      handleCloseDeleteConfirm();
    } catch (err) {
      setError("Failed to delete rule. Please try again.");
      console.error("Error deleting rule:", err);
      handleCloseDeleteConfirm();
    }
  };

  const handleRunRuleNow = async (ruleId: string) => {
    try {
      if (isOffline) {
        queueAction({
          type: "runRule",
          payload: { ruleId },
        }); // Fixed argument structure
        // Show message to user
        return;
      }

      await automationService.runRule(ruleId);
      // Refresh rules to get updated status
      loadRules();
    } catch (err) {
      setError("Failed to run rule. Please try again.");
      console.error("Error running rule:", err);
    }
  };

  const formatTriggerDescription = (rule: Rule): string => {
    const { type, config } = rule.trigger;

    if (type === "event") {
      return `When ${config.eventType.replace(".", " is ")}`;
    } else if (type === "schedule") {
      if (config.frequency === "daily") {
        return `Daily at ${config.time}`;
      } else if (config.frequency === "weekly") {
        const days = config.days
          .map((day: string) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(", ");
        return `Weekly on ${days} at ${config.time}`;
      } else if (config.frequency === "monthly") {
        return `Monthly at ${config.time}`;
      } else {
        return `${
          config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)
        } at ${config.time}`;
      }
    } else if (type === "condition") {
      const { entity, field, operator, value, duration } = config;
      let operatorText = "";

      switch (operator) {
        case "equals":
          operatorText = "equals";
          break;
        case "not_equals":
          operatorText = "does not equal";
          break;
        case "contains":
          operatorText = "contains";
          break;
        case "greater_than":
          operatorText = "is greater than";
          break;
        case "less_than":
          operatorText = "is less than";
          break;
        case "is_empty":
          operatorText = "is empty";
          break;
        case "is_not_empty":
          operatorText = "is not empty";
          break;
        default:
          operatorText = operator;
      }

      let conditionText = `When ${entity} ${field} ${operatorText}`;
      if (operator !== "is_empty" && operator !== "is_not_empty") {
        conditionText += ` ${value}`;
      }

      if (duration) {
        conditionText += ` for ${duration.value} ${duration.unit}`;
      }

      return conditionText;
    }

    return "Unknown trigger type";
  };

  const formatActionsDescription = (rule: Rule): string => {
    if (!rule.actions || rule.actions.length === 0) {
      return "No actions defined";
    }

    return rule.actions
      .map((action, index) => {
        if (action.type === "notification") {
          return `Send notification to ${action.config.recipients.join(", ")}`;
        } else if (action.type === "status_update") {
          return `Update ${action.config.entity} ${action.config.field} to ${action.config.value}`;
        } else if (action.type === "assignment") {
          return `Assign ${action.config.entity} to ${action.config.assignee}`;
        } else if (action.type === "webhook") {
          return `Call webhook at ${action.config.url}`;
        }
        return `Action ${index + 1}: ${action.type}`;
      })
      .join("; ");
  };

  // If selected rule is null, show a message
  if (showRuleBuilder && selectedRule === null) {
    return (
      <ActionBuilder
        onSave={handleSaveRule}
        onCancel={handleCloseRuleBuilder}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Automation Rules
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateRule}
          disabled={isOffline}
          aria-label="Create new automation rule"
        >
          Create Rule
        </Button>
      </Box>

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "error.light",
            color: "error.contrastText",
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      {loading && !showRuleBuilder ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {rules.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  No Automation Rules Found
                </Typography>
                <Typography variant="body1" paragraph>
                  Create your first automation rule to streamline your safety
                  workflows.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateRule}
                  disabled={isOffline}
                  aria-label="Create your first automation rule"
                >
                  Create Rule
                </Button>
              </Paper>
            </Grid>
          ) : (
            rules.map((rule) => (
              <Grid item xs={12} md={6} lg={4} key={rule.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: "4px solid",
                    borderColor: rule.enabled
                      ? rule.status === "error"
                        ? "error.main"
                        : "success.main"
                      : "grey.400",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" component="h2" gutterBottom>
                        {rule.name}
                      </Typography>
                      <Chip
                        label={rule.enabled ? "Enabled" : "Disabled"}
                        color={rule.enabled ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    {rule.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {rule.description}
                      </Typography>
                    )}

                    <Typography variant="subtitle2" gutterBottom>
                      Trigger:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {formatTriggerDescription(rule)}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      Actions:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {formatActionsDescription(rule)}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        Last updated:{" "}
                        {new Date(rule.updatedAt).toLocaleString()}
                      </Typography>
                      {rule.lastRun && (
                        <Typography variant="caption" display="block">
                          Last run: {new Date(rule.lastRun).toLocaleString()}
                        </Typography>
                      )}
                      {rule.status === "error" && (
                        <Typography
                          variant="caption"
                          color="error"
                          display="block"
                        >
                          Last run failed. Check rule history for details.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleEditRule(rule)}
                      aria-label={`Edit rule ${rule.name}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        handleToggleRuleStatus(rule.id, !rule.enabled)
                      }
                      aria-label={
                        rule.enabled
                          ? `Disable rule ${rule.name}`
                          : `Enable rule ${rule.name}`
                      }
                    >
                      {rule.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleRunRuleNow(rule.id)}
                      disabled={!rule.enabled || isOffline}
                      aria-label={`Run rule ${rule.name} now`}
                    >
                      Run Now
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteConfirm(rule.id)}
                      aria-label={`Delete rule ${rule.name}`}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Rule Builder Dialog */}
      {showRuleBuilder && selectedRule && (
        <ActionBuilder
          rule={selectedRule} // Pass rule for editing
          onSave={handleSaveRule}
          onCancel={handleCloseRuleBuilder}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Automation Rule
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this automation rule? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRule} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationDashboard;
