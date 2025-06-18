import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface IncidentSeverityData {
  severity: string;
  count: number;
  color: string;
}

interface IncidentSeverityChartProps {
  data?: IncidentSeverityData[];
  title?: string;
  height?: number;
}

const defaultData: IncidentSeverityData[] = [
  { severity: "Low", count: 25, color: "#4caf50" },
  { severity: "Medium", count: 18, color: "#ff9800" },
  { severity: "High", count: 12, color: "#f44336" },
  { severity: "Critical", count: 3, color: "#9c27b0" },
];

const IncidentSeverityChart: React.FC<IncidentSeverityChartProps> = ({
  data = defaultData,
  title = "Incident Severity Distribution",
  height = 300,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            p: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label} Severity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Incidents: {data.count}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" tick={{ fontSize: 12 }} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count" // Added the required dataKey property
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Summary Statistics
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2">
              Total Incidents: {data.reduce((sum, item) => sum + item.count, 0)}
            </Typography>
            <Typography variant="body2">
              Highest:{" "}
              {
                data.reduce(
                  (max, item) => (item.count > max.count ? item : max),
                  data[0],
                )?.severity
              }
            </Typography>
            <Typography variant="body2">
              Critical/High:{" "}
              {data
                .filter((item) => ["Critical", "High"].includes(item.severity))
                .reduce((sum, item) => sum + item.count, 0)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IncidentSeverityChart;
