import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Security,
  Warning,
  CheckCircle,
  Info,
} from "@mui/icons-material";

interface SafetyMetric {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  trend: "up" | "down" | "flat";
  trendValue: number;
  color: "success" | "warning" | "error" | "info";
}

interface SafetyScoreCardProps {
  overallScore?: number;
  metrics?: SafetyMetric[];
  title?: string;
  period?: string;
}

const defaultMetrics: SafetyMetric[] = [
  {
    label: "Incident Rate",
    value: 2.1,
    maxValue: 10,
    unit: "per 100 employees",
    trend: "down",
    trendValue: -15,
    color: "success",
  },
  {
    label: "Compliance Score",
    value: 94,
    maxValue: 100,
    unit: "%",
    trend: "up",
    trendValue: 3,
    color: "success",
  },
  {
    label: "Training Completion",
    value: 87,
    maxValue: 100,
    unit: "%",
    trend: "up",
    trendValue: 8,
    color: "warning",
  },
  {
    label: "Near Miss Reports",
    value: 23,
    maxValue: 50,
    unit: "this month",
    trend: "up",
    trendValue: 12,
    color: "info",
  },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp fontSize="small" />;
    case "down":
      return <TrendingDown fontSize="small" />;
    case "flat":
      return <TrendingFlat fontSize="small" />;
    default:
      return <TrendingFlat fontSize="small" />;
  }
};

const getTrendColor = (trend: string, isPositive: boolean) => {
  if (trend === "flat") return "text.secondary";
  if (isPositive) {
    return trend === "up" ? "success.main" : "error.main";
  } else {
    return trend === "down" ? "success.main" : "error.main";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "success.main";
  if (score >= 75) return "warning.main";
  if (score >= 60) return "error.main";
  return "error.dark";
};

const getScoreIcon = (score: number) => {
  if (score >= 90) return <CheckCircle color="success" />;
  if (score >= 75) return <Warning color="warning" />;
  if (score >= 60) return <Warning color="error" />;
  return <Warning color="error" />;
};

const SafetyScoreCard: React.FC<SafetyScoreCardProps> = ({
  overallScore = 88,
  metrics = defaultMetrics,
  title = "Safety Performance Score",
  period = "Last 30 days",
}) => {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {period}
            </Typography>
          </Box>
          <Security color="primary" />
        </Box>

        {/* Overall Score */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
            }}
          >
            {getScoreIcon(overallScore)}
            <Typography
              variant="h2"
              component="div"
              sx={{
                ml: 1,
                color: getScoreColor(overallScore),
                fontWeight: "bold",
              }}
            >
              {overallScore}
            </Typography>
            <Typography variant="h4" color="text.secondary" sx={{ ml: 0.5 }}>
              /100
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Overall Safety Score
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overallScore}
            sx={{
              height: 8,
              borderRadius: 4,
              mt: 1,
              "& .MuiLinearProgress-bar": {
                backgroundColor: getScoreColor(overallScore),
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metrics Grid */}
        <Grid container spacing={2}>
          {metrics.map((metric, index) => {
            const isPositiveMetric =
              metric.label === "Compliance Score" ||
              metric.label === "Training Completion";
            const progressValue = (metric.value / metric.maxValue) * 100;

            return (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${metric.trendValue > 0 ? "+" : ""}${metric.trendValue}%`}
                      icon={getTrendIcon(metric.trend)}
                      sx={{
                        color: getTrendColor(metric.trend, isPositiveMetric),
                        backgroundColor: "transparent",
                        border: "none",
                        "& .MuiChip-icon": {
                          color: getTrendColor(metric.trend, isPositiveMetric),
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                    {metric.value}{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {metric.unit}
                    </Typography>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    color={metric.color}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "background.default",
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Info color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              Performance Summary
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {overallScore >= 90 &&
              "Excellent safety performance. Continue current practices and monitor for consistency."}
            {overallScore >= 75 &&
              overallScore < 90 &&
              "Good safety performance with room for improvement. Focus on training completion and incident prevention."}
            {overallScore >= 60 &&
              overallScore < 75 &&
              "Moderate safety performance. Immediate attention needed for compliance and training gaps."}
            {overallScore < 60 &&
              "Poor safety performance. Urgent action required across all safety metrics."}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SafetyScoreCard;
