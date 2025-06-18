import React, { useState, useEffect, useCallback } from "react";
import { Typography, Box, Button } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useOffline } from "../contexts/OfflineContext";
import { riskService } from "../services/riskService";

interface RiskAssessmentCardProps {
  assessmentId?: string;
  onUpdate?: (assessment: any) => void;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  assessmentId,
  onUpdate,
}) => {
  const { user: currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline, queueAction } = useOffline();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssessment = useCallback(async () => {
    if (!assessmentId) {
      return;
    }

    setLoading(true);
    try {
      let assessmentData;
      if (isOffline) {
        // Try to get cached data when offline
        const cachedAssessment =
          await riskService.getCachedAssessment(assessmentId);
        if (cachedAssessment) {
          setAssessment(cachedAssessment);
          setError(null);
          setLoading(false);
          return;
        }
      }

      assessmentData = await riskService.getAssessment(assessmentId);
      setAssessment(assessmentData);
      setError(null);
    } catch (err) {
      setError("Failed to load assessment");
      console.error("Error loading assessment:", err);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, isOffline]);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId, loadAssessment]);

  const handleStatusChange = async (newStatus: string) => {
    if (!assessment) {
      return;
    }

    try {
      if (isOffline) {
        queueAction({
          type: "updateAssessmentStatus",
          data: {
            assessmentId: assessment.id,
            status: newStatus,
          },
        });
        // Update UI optimistically
        const updatedAssessment = { ...assessment, status: newStatus };
        setAssessment(updatedAssessment);
        if (onUpdate) {
          onUpdate(updatedAssessment);
        }
        return;
      }

      const updatedAssessment = await riskService.updateAssessmentStatus(
        assessment.id,
        newStatus,
      );
      setAssessment(updatedAssessment);
      if (onUpdate) {
        onUpdate(updatedAssessment);
      }
    } catch (err) {
      setError("Failed to update assessment status");
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
        <Typography variant="body1">Loading risk assessment...</Typography>
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
        <Typography variant="body1" color="error">
          {error || "Risk assessment not found"}
        </Typography>
        {assessmentId && (
          <Button
            variant="outlined"
            size="small"
            onClick={loadAssessment}
            sx={{ mt: 1 }}
            aria-label="Retry loading risk assessment"
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#f57c00";
      case "medium":
        return "#fbc02d";
      case "low":
        return "#388e3c";
      default:
        return "#757575";
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        borderLeft: `4px solid ${getSeverityColor(assessment.severity)}`,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography variant="h6">{assessment.title}</Typography>
        <Box
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: getSeverityColor(assessment.severity),
            color: "white",
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {assessment.severity.toUpperCase()}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        ID: {assessment.id} | Created:{" "}
        {new Date(assessment.createdAt).toLocaleDateString()}
      </Typography>

      <Typography variant="body1" paragraph>
        {assessment.description}
      </Typography>

      {assessment.riskFactors && assessment.riskFactors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Risk Factors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            {assessment.riskFactors.map((factor: string, index: number) => (
              <li key={index}>
                <Typography variant="body2">{factor}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}

      {assessment.controls && assessment.controls.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Controls:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            {assessment.controls.map((control: any, index: number) => (
              <li key={index}>
                <Typography variant="body2">
                  {control.description}
                  {control.implemented ? (
                    <span style={{ color: "#388e3c", marginLeft: "0.5rem" }}>
                      (Implemented)
                    </span>
                  ) : (
                    <span style={{ color: "#d32f2f", marginLeft: "0.5rem" }}>
                      (Not Implemented)
                    </span>
                  )}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body2" component="span" sx={{ mr: 1 }}>
            Status:
          </Typography>
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.5,
              bgcolor:
                assessment.status === "open"
                  ? "#f57c00"
                  : assessment.status === "in-progress"
                    ? "#1976d2"
                    : assessment.status === "mitigated"
                      ? "#388e3c"
                      : assessment.status === "accepted"
                        ? "#9c27b0"
                        : "#757575",
              color: "white",
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {assessment.status.toUpperCase()}
          </Box>
        </Box>

        <Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleStatusChange("in-progress")}
            disabled={assessment.status === "in-progress"}
            sx={{ mr: 1 }}
            aria-label="Mark risk assessment as in progress"
          >
            In Progress
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleStatusChange("mitigated")}
            disabled={assessment.status === "mitigated"}
            sx={{ mr: 1 }}
            aria-label="Mark risk assessment as mitigated"
          >
            Mitigated
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleStatusChange("accepted")}
            disabled={assessment.status === "accepted"}
            aria-label="Mark risk assessment as accepted"
          >
            Accepted
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RiskAssessmentCard;
