import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Grid, Paper, Divider } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useOffline } from "../contexts/OfflineContext";
import { aiService } from "../services/aiService";

interface Entity {
  id: string;
  type: string;
  data: Record<string, any>;
  name?: string;
  title?: string;
}

interface AIResult {
  analysis: string;
  recommendations: string[];
  confidence: number;
  metadata: Record<string, any>;
  type?: string;
  sections?: any[];
  metrics?: Record<string, any>;
}

interface AIIntegrationProps {
  entityType?: string;
  entityId?: string;
}

const AIIntegration: React.FC<AIIntegrationProps> = ({
  entityType,
  entityId,
}) => {
  const { user: currentUser } = useAuth();
  const { highContrast } = useAccessibility();
  const { isOffline } = useOffline();

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      loadEntity();
    }
  }, [entityType, entityId]); // Fixing exhaustive-deps warning

  const loadEntity = async () => {
    if (!entityType || !entityId) {
      return;
    }

    setLoading(true);
    try {
      const entity = await aiService.getEntity(entityType, entityId);
      setSelectedEntity(entity);
      setError(null);
    } catch (err) {
      setError("Failed to load entity data");
      setSelectedEntity(null);
    } finally {
      setLoading(false);
    }
  };

  const analyzeEntity = async () => {
    if (!selectedEntity) {
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await aiService.analyzeEntity(
        entityType!,
        entityId!,
      );
      setResult(analysisResult);
      setError(null);
    } catch (err) {
      setError("Failed to analyze entity");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedEntity) {
      return;
    }

    setLoading(true);
    try {
      const recommendations = await aiService.generateRecommendations(
        entityType!,
        entityId!,
      );
      setResult(recommendations);
      setError(null);
    } catch (err) {
      setError("Failed to generate recommendations");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (!entityType || !entityId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          AI Integration
        </Typography>
        <Typography variant="body1">
          Please select an entity to analyze.
        </Typography>
      </Box>
    );
  }

  if (!selectedEntity) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          AI Integration
        </Typography>
        {loading ? (
          <Typography variant="body1">Loading entity data...</Typography>
        ) : (
          <Typography variant="body1" color="error">
            {error || "Entity not found"}
          </Typography>
        )}
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          AI Integration - {entityType}:{" "}
          {selectedEntity.name || selectedEntity.title || selectedEntity.id}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Select an AI analysis to perform:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={analyzeEntity}
              disabled={loading}
              aria-label="Analyze entity"
            >
              Analyze
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={generateRecommendations}
              disabled={loading}
              aria-label="Generate recommendations"
            >
              Generate Recommendations
            </Button>
          </Box>
          {loading && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Processing... This may take a moment.
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Integration - {entityType}:{" "}
        {selectedEntity.name || selectedEntity.title || selectedEntity.id}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {result.type === "analysis" ? "Analysis Results" : "Recommendations"}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {result.type === "analysis" ? (
          <Box>
            {result.sections.map((section: any, index: number) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {section.title}
                </Typography>
                <Typography variant="body1">{section.content}</Typography>
              </Box>
            ))}

            {result.metrics && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(result.metrics).map(
                    ([key, value]: [string, any]) => (
                      <Grid item xs={6} md={3} key={key}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                          <Typography variant="h6">{value}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Typography>
                        </Paper>
                      </Grid>
                    ),
                  )}
                </Grid>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {result.recommendations.map(
              (recommendation: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {recommendation.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {recommendation.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Priority: {recommendation.priority} | Effort:{" "}
                    {recommendation.effort}
                  </Typography>
                  {recommendation.actionItems && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Action Items:
                      </Typography>
                      <ul>
                        {recommendation.actionItems.map(
                          (item: string, i: number) => (
                            <li key={i}>
                              <Typography variant="body2">{item}</Typography>
                            </li>
                          ),
                        )}
                      </ul>
                    </Box>
                  )}
                </Box>
              ),
            )}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setResult(null)}
          aria-label="Back to analysis options"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={
            result.type === "analysis" ? generateRecommendations : analyzeEntity
          }
          aria-label={
            result.type === "analysis"
              ? "Generate recommendations"
              : "Analyze entity"
          }
        >
          {result.type === "analysis"
            ? "Generate Recommendations"
            : "View Analysis"}
        </Button>
      </Box>
    </Box>
  );
};

export default AIIntegration;
