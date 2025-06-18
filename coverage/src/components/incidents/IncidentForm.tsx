import React, { useState } from "react";
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
} from "@mui/material";
import { Incident } from "../../store/slices/incidentSlice";
import { useAppDispatch } from "../../store/index";
import {
  createIncident,
  updateIncident,
} from "../../store/slices/incidentSlice";
import { v4 as uuidv4 } from "uuid";

interface IncidentFormProps {
  incident?: Incident;
  onSuccess?: (incident: Incident) => void;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  incident,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = React.useState(incident?.title || "");
  const [description, setDescription] = React.useState(
    incident?.description || "",
  );
  const [location, setLocation] = React.useState(incident?.location || "");
  const [date, setDate] = React.useState(
    incident?.date
      ? new Date(incident.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [severity, setSeverity] = React.useState<
    "low" | "medium" | "high" | "critical"
  >((incident?.severity as "low" | "medium" | "high" | "critical") || "medium");
  const [witnesses, setWitnesses] = React.useState(
    incident?.witnesses?.join(", ") || "",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const isEditMode = !!incident;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !location || !date || !severity) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const witnessArray = witnesses
        ? witnesses
            .split(",")
            .map((witness) => witness.trim())
            .filter(Boolean)
        : [];

      const incidentData = {
        title,
        description,
        location,
        date,
        severity: severity as "low" | "medium" | "high" | "critical",
        witnesses: witnessArray,
        status: incident?.status || "reported",
        reportedBy: incident?.reportedBy || "current-user", // This would be replaced by the actual user ID
      };

      let result;

      if (isEditMode && incident) {
        result = await dispatch(
          updateIncident({
            id: incident.id,
            data: incidentData,
          }),
        ).unwrap();
      } else {
        const newIncident = {
          ...incidentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Remove id from the object we're creating to avoid the TypeScript error
        result = await dispatch(createIncident(newIncident)).unwrap();
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? "Edit Incident" : "Report New Incident"}
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
            <TextField
              required
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                value={severity}
                onChange={(e) =>
                  setSeverity(
                    e.target.value as "low" | "medium" | "high" | "critical",
                  )
                }
                label="Severity"
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
            <TextField
              fullWidth
              label="Witnesses (comma separated)"
              value={witnesses}
              onChange={(e) => setWitnesses(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="John Doe, Jane Smith"
            />
          </Grid>

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
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Incident"
                    : "Report Incident"}
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
            ? "Incident updated successfully!"
            : "Incident reported successfully!"}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default IncidentForm;
