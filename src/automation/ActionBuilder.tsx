import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export interface ActionBuilderProps {
  action?: {
    actionType: string;
    actionConfig: {
      notificationType: string;
      notificationTemplate: string;
      recipientRoles: any[];
    };
  };
  rule?: any;
  onChange?: (updatedAction: any) => void;
  onSave?: (ruleData: any) => void;
  validationErrors?: Record<string, any>;
  onCancel?: () => void;
  actionIndex?: number;
}

const ActionBuilder: React.FC<ActionBuilderProps> = ({
  action,
  onChange,
  validationErrors,
  onCancel,
}) => {
  useAuth();

  const [currentRule, setCurrentRule] = useState<any>({
    name: "",
    description: "",
    trigger: {
      type: "event",
      config: {},
    },
    actions: [
      {
        type: "notification",
        config: {
          recipients: [],
          message: "",
        },
      },
    ],
    enabled: true,
    ...action,
  });

  const [triggerType, setTriggerType] = useState<string>("event");
  const [actionConfigs, setActionConfigs] = useState<any[]>([
    {
      type: "notification",
      config: {
        recipients: [],
        message: "",
      },
    },
  ]);

  const handleRuleChange = (field: string, value: any) => {
    setCurrentRule((prev: typeof currentRule) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTriggerChange = (config: any) => {
    setCurrentRule((prev: typeof currentRule) => ({
      ...prev,
      trigger: {
        type: triggerType as "event" | "schedule" | "condition",
        config,
      },
    }));
  };

  const handleActionChange = (index: number, action: any) => {
    const updatedActions = [...actionConfigs];
    updatedActions[index] = action;
    setActionConfigs(updatedActions);

    setCurrentRule((prev: typeof currentRule) => ({
      ...prev,
      actions: updatedActions,
    }));
  };

  const handleAddAction = () => {
    const newAction = {
      type: "notification",
      config: {
        recipients: [],
        message: "",
      },
    };

    setActionConfigs((prev: typeof actionConfigs) => [...prev, newAction]);
    setCurrentRule((prev: typeof currentRule) => ({
      ...prev,
      actions: [...prev.actions, newAction],
    }));
  };

  const handleRemoveAction = (index: number) => {
    const updatedActions = actionConfigs.filter((_, i) => i !== index);
    setActionConfigs(updatedActions);

    setCurrentRule((prev: typeof currentRule) => ({
      ...prev,
      actions: updatedActions,
    }));
  };

  const handleSave = () => {
    const ruleToSave = {
      ...currentRule,
      trigger: {
        type: triggerType as "event" | "schedule" | "condition",
        config: currentRule.trigger?.config || {},
      },
    };

    if (typeof onChange === "function") {
      onChange(ruleToSave);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {action ? "Edit Automation Rule" : "Create Automation Rule"}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Rule Name"
              value={currentRule.name || ""}
              onChange={(e) => handleRuleChange("name", e.target.value)}
              fullWidth
              variant="outlined"
              error={!!validationErrors?.name}
              helperText={validationErrors?.name || ""}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              value={currentRule.description || ""}
              onChange={(e) => handleRuleChange("description", e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              error={!!validationErrors?.description}
              helperText={validationErrors?.description || ""}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentRule.enabled || false}
                  onChange={(e) =>
                    handleRuleChange("enabled", e.target.checked)
                  }
                />
              }
              label="Enable Rule"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trigger Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                label="Trigger Type"
              >
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="schedule">Schedule</MenuItem>
                <MenuItem value="condition">Condition</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {triggerType === "event" && (
            <Grid item xs={12}>
              <TextField
                label="Event Type"
                value={currentRule.trigger?.config?.eventType || ""}
                onChange={(e) =>
                  handleTriggerChange({
                    ...currentRule.trigger?.config,
                    eventType: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                error={!!validationErrors?.trigger?.eventType}
                helperText={validationErrors?.trigger?.eventType}
              />
            </Grid>
          )}

          {triggerType === "schedule" && (
            <Grid item xs={12}>
              <TextField
                label="Schedule (Cron Expression)"
                value={currentRule.trigger?.config?.schedule || ""}
                onChange={(e) =>
                  handleTriggerChange({
                    ...currentRule.trigger?.config,
                    schedule: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                placeholder="0 9 * * 1-5"
                error={!!validationErrors?.trigger?.schedule}
                helperText={validationErrors?.trigger?.schedule}
              />
            </Grid>
          )}

          {triggerType === "condition" && (
            <Grid item xs={12}>
              <TextField
                label="Condition"
                value={currentRule.trigger?.config?.condition || ""}
                onChange={(e) =>
                  handleTriggerChange({
                    ...currentRule.trigger?.config,
                    condition: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                error={!!validationErrors?.trigger?.condition}
                helperText={validationErrors?.trigger?.condition}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>

        {actionConfigs.map((action, index) => (
          <Box
            key={index}
            sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={action.type}
                    onChange={(e) =>
                      handleActionChange(index, {
                        ...action,
                        type: e.target.value,
                      })
                    }
                    label="Action Type"
                  >
                    <MenuItem value="notification">Notification</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="webhook">Webhook</MenuItem>
                    <MenuItem value="task">Create Task</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveAction(index)}
                  disabled={actionConfigs.length === 1}
                >
                  Remove Action
                </Button>
              </Grid>

              {action.type === "notification" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Message"
                      value={action.config?.message || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, message: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      error={!!validationErrors?.actions?.[index]?.message}
                      helperText={validationErrors?.actions?.[index]?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Recipients (comma-separated)"
                      value={action.config?.recipients?.join(", ") || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: {
                            ...action.config,
                            recipients: e.target.value
                              .split(",")
                              .map((r) => r.trim()),
                          },
                        })
                      }
                      fullWidth
                      variant="outlined"
                      error={!!validationErrors?.actions?.[index]?.recipients}
                      helperText={
                        validationErrors?.actions?.[index]?.recipients
                      }
                    />
                  </Grid>
                </>
              )}

              {action.type === "email" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Subject"
                      value={action.config?.subject || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, subject: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Body"
                      value={action.config?.body || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, body: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Recipients (comma-separated)"
                      value={action.config?.recipients?.join(", ") || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: {
                            ...action.config,
                            recipients: e.target.value
                              .split(",")
                              .map((r) => r.trim()),
                          },
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}

              {action.type === "webhook" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Webhook URL"
                      value={action.config?.url || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, url: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Payload (JSON)"
                      value={action.config?.payload || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, payload: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}

              {action.type === "task" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Title"
                      value={action.config?.title || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: { ...action.config, title: e.target.value },
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Description"
                      value={action.config?.description || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: {
                            ...action.config,
                            description: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Assignee"
                      value={action.config?.assignee || ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          ...action,
                          config: {
                            ...action.config,
                            assignee: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        ))}

        <Button variant="outlined" onClick={handleAddAction} sx={{ mt: 2 }}>
          Add Action
        </Button>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" onClick={handleSave}>
          Save Rule
        </Button>
      </Box>
    </Box>
  );
};

export default ActionBuilder;
