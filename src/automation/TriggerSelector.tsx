import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";

interface TriggerSelectorProps {
  triggerType: string;
  triggerConfig: any;
  onTriggerTypeChange: (type: string) => void;
  onTriggerConfigChange: (config: any) => void;
  onConditionChange: (condition: any) => void;
  validationErrors?: any;
}

/**
 * TriggerSelector component
 * Allows selection and configuration of automation rule triggers
 */
const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  triggerType,
  triggerConfig,
  onTriggerTypeChange,
  onTriggerConfigChange,
  onConditionChange,
  validationErrors = {},
}) => {
  // Available event types
  const eventTypes = [
    { value: "incident.created", label: "Incident Created" },
    { value: "incident.updated", label: "Incident Updated" },
    { value: "incident.status_changed", label: "Incident Status Changed" },
    { value: "risk.created", label: "Risk Assessment Created" },
    { value: "risk.updated", label: "Risk Assessment Updated" },
    { value: "risk.level_changed", label: "Risk Level Changed" },
    { value: "document.created", label: "Document Created" },
    { value: "document.updated", label: "Document Updated" },
    { value: "document.approved", label: "Document Approved" },
    { value: "audit.created", label: "Audit Created" },
    { value: "audit.completed", label: "Audit Completed" },
    { value: "audit.finding_created", label: "Audit Finding Created" },
    { value: "compliance.status_changed", label: "Compliance Status Changed" },
    { value: "task.created", label: "Task Created" },
    { value: "task.completed", label: "Task Completed" },
    { value: "task.overdue", label: "Task Overdue" },
  ];

  // Available entities for condition-based triggers
  const entities = [
    { value: "incident", label: "Incident" },
    { value: "risk", label: "Risk Assessment" },
    { value: "document", label: "Document" },
    { value: "audit", label: "Audit" },
    { value: "compliance", label: "Compliance" },
    { value: "task", label: "Task" },
  ];

  // Fields for each entity type
  const entityFields: Record<
    string,
    Array<{ value: string; label: string }>
  > = {
    incident: [
      { value: "severity", label: "Severity" },
      { value: "status", label: "Status" },
      { value: "location", label: "Location" },
      { value: "type", label: "Incident Type" },
      { value: "reportedBy", label: "Reported By" },
    ],
    risk: [
      { value: "riskLevel", label: "Risk Level" },
      { value: "status", label: "Status" },
      { value: "category", label: "Category" },
      { value: "likelihood", label: "Likelihood" },
      { value: "severity", label: "Severity" },
    ],
    document: [
      { value: "status", label: "Status" },
      { value: "type", label: "Document Type" },
      { value: "category", label: "Category" },
      { value: "approvalStatus", label: "Approval Status" },
    ],
    audit: [
      { value: "status", label: "Status" },
      { value: "type", label: "Audit Type" },
      { value: "findingCount", label: "Finding Count" },
      { value: "complianceScore", label: "Compliance Score" },
    ],
    compliance: [
      { value: "status", label: "Status" },
      { value: "standard", label: "Standard" },
      { value: "complianceScore", label: "Compliance Score" },
      { value: "dueDate", label: "Due Date" },
    ],
    task: [
      { value: "status", label: "Status" },
      { value: "priority", label: "Priority" },
      { value: "dueDate", label: "Due Date" },
      { value: "assignedTo", label: "Assigned To" },
    ],
  };

  // Operators for condition-based triggers
  const operators = [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Not Equals" },
    { value: "greaterThan", label: "Greater Than" },
    { value: "lessThan", label: "Less Than" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not Contains" },
  ];

  // Handle event type change
  const handleEventTypeChange = (e: any) => {
    onTriggerConfigChange({ eventType: e.target.value });
  };

  // Handle event source change
  const handleEventSourceChange = (e: any) => {
    onTriggerConfigChange({ eventSource: e.target.value });
  };

  // Handle schedule change
  const handleScheduleChange = (e: any) => {
    onTriggerConfigChange({ schedule: e.target.value });
  };

  // Handle condition entity change
  const handleConditionEntityChange = (e: any) => {
    const entity = e.target.value;
    onConditionChange({
      ...triggerConfig.condition,
      entity,
      field: "",
      value: "",
    });
  };

  // Handle condition field change
  const handleConditionFieldChange = (e: any) => {
    onConditionChange({
      ...triggerConfig.condition,
      field: e.target.value,
    });
  };

  // Handle condition operator change
  const handleConditionOperatorChange = (e: any) => {
    onConditionChange({
      ...triggerConfig.condition,
      operator: e.target.value,
    });
  };

  // Handle condition value change
  const handleConditionValueChange = (e: any) => {
    onConditionChange({
      ...triggerConfig.condition,
      value: e.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trigger Type
      </Typography>

      <RadioGroup
        row
        value={triggerType}
        onChange={(e) => onTriggerTypeChange(e.target.value)}
      >
        <FormControlLabel
          value="event"
          control={<Radio />}
          label="Event-based"
        />
        <FormControlLabel
          value="condition"
          control={<Radio />}
          label="Condition-based"
        />
        <FormControlLabel
          value="schedule"
          control={<Radio />}
          label="Schedule-based"
        />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {triggerType === "event" && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Event Configuration
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.eventType}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={triggerConfig.eventType || ""}
                  onChange={handleEventTypeChange}
                  label="Event Type"
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.eventType && (
                  <FormHelperText>{validationErrors.eventType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Source (Optional)"
                value={triggerConfig.eventSource || ""}
                onChange={handleEventSourceChange}
                helperText="Limit to specific source (e.g., module or component)"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {triggerType === "condition" && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Condition Configuration
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={!!validationErrors.conditionEntity}
                >
                  <InputLabel>Entity</InputLabel>
                  <Select
                    value={triggerConfig.condition?.entity || ""}
                    onChange={handleConditionEntityChange}
                    label="Entity"
                  >
                    {entities.map((entity) => (
                      <MenuItem key={entity.value} value={entity.value}>
                        {entity.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.conditionEntity && (
                    <FormHelperText>
                      {validationErrors.conditionEntity}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  disabled={!triggerConfig.condition?.entity}
                  error={!!validationErrors.conditionField}
                >
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={triggerConfig.condition?.field || ""}
                    onChange={handleConditionFieldChange}
                    label="Field"
                  >
                    {triggerConfig.condition?.entity &&
                      entityFields[triggerConfig.condition.entity]?.map(
                        (field) => (
                          <MenuItem key={field.value} value={field.value}>
                            {field.label}
                          </MenuItem>
                        ),
                      )}
                  </Select>
                  {validationErrors.conditionField && (
                    <FormHelperText>
                      {validationErrors.conditionField}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  disabled={!triggerConfig.condition?.field}
                >
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={triggerConfig.condition?.operator || "equals"}
                    onChange={handleConditionOperatorChange}
                    label="Operator"
                  >
                    {operators.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={triggerConfig.condition?.value || ""}
                  onChange={handleConditionValueChange}
                  disabled={!triggerConfig.condition?.field}
                  helperText="The value to compare against"
                  error={!!validationErrors.conditionValue}
                />
                {validationErrors.conditionValue && (
                  <FormHelperText error>
                    {validationErrors.conditionValue}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="body2" color="text.secondary">
            This rule will be triggered when the specified condition is met.
          </Typography>
        </Box>
      )}

      {triggerType === "schedule" && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Schedule Configuration
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cron Expression"
                value={triggerConfig.schedule || ""}
                onChange={handleScheduleChange}
                error={!!validationErrors.schedule}
                helperText={
                  validationErrors.schedule ||
                  "Use cron syntax (e.g., '0 9 * * 1' for every Monday at 9 AM)"
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Common examples:
            </Typography>
            <Tooltip title="Every day at midnight">
              <Typography
                variant="body2"
                sx={{ ml: 1, cursor: "pointer" }}
                onClick={() => onTriggerConfigChange({ schedule: "0 0 * * *" })}
              >
                Daily
              </Typography>
            </Tooltip>
            <Typography variant="body2" sx={{ mx: 0.5 }}>
              |
            </Typography>
            <Tooltip title="Every Monday at 9 AM">
              <Typography
                variant="body2"
                sx={{ cursor: "pointer" }}
                onClick={() => onTriggerConfigChange({ schedule: "0 9 * * 1" })}
              >
                Weekly
              </Typography>
            </Tooltip>
            <Typography variant="body2" sx={{ mx: 0.5 }}>
              |
            </Typography>
            <Tooltip title="First day of each month at 6 AM">
              <Typography
                variant="body2"
                sx={{ cursor: "pointer" }}
                onClick={() => onTriggerConfigChange({ schedule: "0 6 1 * *" })}
              >
                Monthly
              </Typography>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TriggerSelector;
