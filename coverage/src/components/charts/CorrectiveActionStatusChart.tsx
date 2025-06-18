import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CorrectiveActionStatusData {
  status: string;
  count: number;
  color: string;
}

interface CorrectiveActionStatusChartProps {
  data?: CorrectiveActionStatusData[];
  title?: string;
  height?: number;
}

const defaultData: CorrectiveActionStatusData[] = [
  { status: "Not Started", count: 8, color: "#9e9e9e" },
  { status: "In Progress", count: 15, color: "#2196f3" },
  { status: "Under Review", count: 6, color: "#ff9800" },
  { status: "Completed", count: 28, color: "#4caf50" },
  { status: "Overdue", count: 4, color: "#f44336" },
];

const CorrectiveActionStatusChart: React.FC<
  CorrectiveActionStatusChartProps
> = ({
  data = defaultData,
  title = "Corrective Action Status",
  height = 300,
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const renderCustomizedLabel = (entry: any) => {
    const percent = ((entry.count / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.count / total) * 100).toFixed(1);
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
            {data.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percent}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const completionRate =
    data.find((item) => item.status === "Completed")?.count || 0;
  const completionPercentage =
    total > 0 ? ((completionRate / total) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Key Metrics
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" color="primary">
                {total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Actions
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="success.main">
                {completionPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="error.main">
                {data.find((item) => item.status === "Overdue")?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="info.main">
                {data.find((item) => item.status === "In Progress")?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CorrectiveActionStatusChart;
