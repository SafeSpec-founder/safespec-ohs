import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Import components
import TriggerSelector from "./TriggerSelector";
// import ActionBuilder from "./ActionBuilder";
// import ActionBuilder from "./ActionBuilder"; // <-- Make sure this file exports the correct ActionBuilder for your usage
import ActionBuilder from "./ActionBuilder"; // <-- Use the correct ActionBuilder for action editing

// Define types for Redux state
interface AuthState {
  user: any;
  roles: any[];
}

interface AutomationState {
  automationRules: any[];
  loading: boolean;
  error: string | null;
}

interface RootState {
  auth: AuthState;
  automation: AutomationState;
}

/**
 * Automation Builder component
 * Visual interface for creating and editing automation rules
 */
const AutomationBuilder = () => {
  const navigate = useNavigate();
  const { ruleId } = useParams();

  // Get state from Redux store with proper typing
  const { automationRules } = useSelector(
    (state: RootState) => state.automation,
  );

  // Local state
  const [activeStep, setActiveStep] = useState(0);
  const [rule, setRule] = useState({
    name: "",
    description: "",
    isActive: true,
    triggerType: "event",
    triggerConfig: {
      eventType: "",
      eventSource: "",
      schedule: "",
      condition: {
        entity: "",
        field: "",
        operator: "equals",
        value: "",
      },
    },
    actions: [
      {
        actionType: "notification",
        actionConfig: {
          notificationType: "info",
          notificationTemplate: "",
          recipientRoles: [],
        },
      },
    ],
    priority: "medium",
  });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpContent] = useState({
    title: "",
    content: "",
  });

  // Steps for the stepper
  const steps = [
    "Basic Information",
    "Define Trigger",
    "Configure Actions",
    "Review & Save",
  ];

  // Load existing rule if editing
  useEffect(() => {
    if (ruleId) {
      // Simulate fetching automation rule
      // dispatch(fetchAutomationRule(ruleId));
      const existingRule = automationRules.find((r: any) => r._id === ruleId);
      if (existingRule) {
        setRule(existingRule);
      }
    }
  }, [ruleId, automationRules]);

  // Handle input changes
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setRule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (e: any) => {
    const { name, checked } = e.target;
    setRule((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle trigger type change
  const handleTriggerTypeChange = (triggerType: any) => {
    setRule((prev) => ({
      ...prev,
      triggerType,
      triggerConfig: {
        ...prev.triggerConfig,
        eventType: triggerType === "event" ? prev.triggerConfig.eventType : "",
        schedule: triggerType === "schedule" ? "" : "",
        condition:
          triggerType === "condition"
            ? prev.triggerConfig.condition
            : {
                entity: "",
                field: "",
                operator: "equals",
                value: "",
              },
      },
    }));
  };

  // Handle trigger config change
  const handleTriggerConfigChange = (config: any) => {
    setRule((prev) => ({
      ...prev,
      triggerConfig: {
        ...prev.triggerConfig,
        ...config,
      },
    }));
  };

  // Handle condition change
  const handleConditionChange = (condition: any) => {
    setRule((prev) => ({
      ...prev,
      triggerConfig: {
        ...prev.triggerConfig,
        condition,
      },
    }));
  };

  // Handle action changes
  const handleAddAction = () => {
    setRule((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          actionType: "notification",
          actionConfig: {
            notificationType: "info",
            notificationTemplate: "",
            recipientRoles: [],
          },
        },
      ],
    }));
  };

  const handleRemoveAction = (index: any) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleActionChange = (index: any, action: any) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions.map((a, i) => (i === index ? action : a)),
    }));
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (step: any) => {
    if (validateStep(step)) {
      setActiveStep(step);
    }
  };

  // Validation
  const validateStep = (step: any) => {
    const errors: any = {};

    if (step === 0) {
      // Basic Information validation
      if (!rule.name.trim()) {
        errors.name = "Name is required";
      }
    } else if (step === 1) {
      // Trigger validation
      if (rule.triggerType === "event") {
        if (!rule.triggerConfig.eventType) {
          errors.eventType = "Event type is required";
        }
      } else if (rule.triggerType === "schedule") {
        if (!rule.triggerConfig.schedule) {
          errors.schedule = "Schedule is required";
        }
      } else if (rule.triggerType === "condition") {
        if (!rule.triggerConfig.condition.entity) {
          errors.conditionEntity = "Entity is required";
        }
        if (!rule.triggerConfig.condition.field) {
          errors.conditionField = "Field is required";
        }
        if (!rule.triggerConfig.condition.value) {
          errors.conditionValue = "Value is required";
        }
      }
    } else if (step === 2) {
      // Actions validation
      rule.actions.forEach((action, index) => {
        if (!action.actionType) {
          errors[`action_${index}_type`] = "Action type is required";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save rule
  const handleSave = async () => {
    if (validateStep(activeStep)) {
      try {
        // Simulate saving rule
        // if (ruleId) {
        //   dispatch(updateAutomationRule(ruleId, rule));
        // } else {
        //   dispatch(createAutomationRule(rule));
        // }

        navigate("/automation");
      } catch (error) {
        console.error("Error saving rule:", error);
      }
    }
  };

  // Help system

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Rule Name"
                value={rule.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={rule.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={rule.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={rule.isActive}
                    onChange={handleSwitchChange}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <TriggerSelector
            triggerType={rule.triggerType}
            triggerConfig={rule.triggerConfig}
            onTriggerTypeChange={handleTriggerTypeChange}
            onTriggerConfigChange={handleTriggerConfigChange}
            onConditionChange={handleConditionChange}
            validationErrors={validationErrors}
          />
        );

      case 2:
        return (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Actions</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAction}
                variant="outlined"
              >
                Add Action
              </Button>
            </Box>

            {rule.actions.map((action, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Action {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveAction(index)}
                      disabled={rule.actions.length === 1}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <ActionBuilder
                    action={action}
                    onChange={(updatedAction: any) =>
                      handleActionChange(index, updatedAction)
                    }
                    validationErrors={validationErrors}
                    actionIndex={index}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Rule
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Typography>
                <strong>Name:</strong> {rule.name}
              </Typography>
              <Typography>
                <strong>Description:</strong> {rule.description}
              </Typography>
              <Typography>
                <strong>Priority:</strong> {rule.priority}
              </Typography>
              <Typography>
                <strong>Status:</strong> {rule.isActive ? "Active" : "Inactive"}
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Trigger
              </Typography>
              <Typography>
                <strong>Type:</strong> {rule.triggerType}
              </Typography>
              {rule.triggerType === "event" && (
                <Typography>
                  <strong>Event Type:</strong> {rule.triggerConfig.eventType}
                </Typography>
              )}
              {rule.triggerType === "schedule" && (
                <Typography>
                  <strong>Schedule:</strong> {rule.triggerConfig.schedule}
                </Typography>
              )}
              {rule.triggerType === "condition" && (
                <Box>
                  <Typography>
                    <strong>Entity:</strong>{" "}
                    {rule.triggerConfig.condition.entity}
                  </Typography>
                  <Typography>
                    <strong>Field:</strong> {rule.triggerConfig.condition.field}
                  </Typography>
                  <Typography>
                    <strong>Operator:</strong>{" "}
                    {rule.triggerConfig.condition.operator}
                  </Typography>
                  <Typography>
                    <strong>Value:</strong> {rule.triggerConfig.condition.value}
                  </Typography>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Actions ({rule.actions.length})
              </Typography>
              {rule.actions.map((action, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Action {index + 1}:</strong> {action.actionType}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

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
        <Typography variant="h4">
          {ruleId ? "Edit Automation Rule" : "Create Automation Rule"}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/automation")}>
          Back to Automation
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{ cursor: "pointer" }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Please fix the validation errors before proceeding.
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<ArrowForwardIcon />}
              >
                Save Rule
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{helpContent.title}</DialogTitle>
        <DialogContent>
          <Typography>{helpContent.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationBuilder;
