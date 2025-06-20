import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { CorrectiveAction } from "../../store/slices/correctiveActionSlice";
import { useAppDispatch, useAppSelector } from "../../store/index";
import {
  createCorrectiveAction,
  updateCorrectiveAction,
} from "../../store/slices/correctiveActionSlice";
import { selectUser } from "../../store/slices/authSlice";
import { v4 as uuidv4 } from "uuid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface CorrectiveActionFormProps {
  correctiveAction?: CorrectiveAction;
  relatedIncidentId?: string;
  relatedHazardId?: string;
  onSuccess?: (correctiveAction: CorrectiveAction) => void;
  onCancel?: () => void;
}

const CorrectiveActionForm: React.FC<CorrectiveActionFormProps> = ({
  correctiveAction,
  relatedIncidentId,
  relatedHazardId,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const [title, setTitle] = React.useState(correctiveAction?.title || "");
  const [description, setDescription] = React.useState(
    correctiveAction?.description || "",
  );
  const [priority, setPriority] = React.useState<
    "low" | "medium" | "high" | "critical"
  >(
    (correctiveAction?.priority as "low" | "medium" | "high" | "critical") ||
      "medium",
  );
  const [dueDate, setDueDate] = React.useState<Date | null>(
    correctiveAction?.dueDate ? new Date(correctiveAction.dueDate) : null,
  );
  const [assignedTo, setAssignedTo] = React.useState(
    correctiveAction?.assignedTo || "",
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const isEditMode = !!correctiveAction;

  // Mock user list - in a real app, this would come from an API
  const users = [
    { id: "user1", name: "John Doe" },
    { id: "user2", name: "Jane Smith" },
    { id: "user3", name: "Robert Johnson" },
    { id: "user4", name: "Emily Davis" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !priority || !dueDate || !assignedTo) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const correctiveActionData = {
        title,
        description,
        priority: priority as "low" | "medium" | "high" | "critical",
        dueDate: dueDate.toISOString(),
        assignedTo,
        assignedBy: currentUser?.id || "current-user", // This would be the actual user ID in a real app
        status: correctiveAction?.status || "open",
        relatedIncidentId:
          correctiveAction?.relatedIncidentId || relatedIncidentId,
        relatedHazardId: correctiveAction?.relatedHazardId || relatedHazardId,
      };

      let result;

      if (isEditMode && correctiveAction) {
        result = await dispatch(
          updateCorrectiveAction({
            id: correctiveAction.id,
            data: correctiveActionData,
          }),
        ).unwrap();
      } else {
        const newAction: Omit<CorrectiveAction, "id" | "createdAt" | "updatedAt"> = {
          ...correctiveActionData,
        };
        result = await dispatch(createCorrectiveAction(newAction)).unwrap();
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save corrective action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? "Edit Corrective Action" : "Create Corrective Action"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as "low" | "medium" | "high" | "critical",
                    )
                  }
                  label="Priority"
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    required: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                <Select
                  labelId="assigned-to-label"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  label="Assigned To"
                  required
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {(relatedIncidentId || correctiveAction?.relatedIncidentId) && (
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  disabled
                >
                  <InputLabel id="related-incident-label">
                    Related Incident
                  </InputLabel>
                  <Select
                    labelId="related-incident-label"
                    value={
                      relatedIncidentId ||
                      correctiveAction?.relatedIncidentId ||
                      ""
                    }
                    label="Related Incident"
                  >
                    <MenuItem
                      value={
                        relatedIncidentId ||
                        correctiveAction?.relatedIncidentId ||
                        ""
                      }
                    >
                      Incident #
                      {relatedIncidentId || correctiveAction?.relatedIncidentId}
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    This corrective action is linked to an incident
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : null
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update"
                      : "Create"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success">
            {isEditMode
              ? "Corrective action updated successfully!"
              : "Corrective action created successfully!"}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default CorrectiveActionForm;
