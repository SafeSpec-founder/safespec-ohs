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

interface IncidentStatusData {
  status: string;
  count: number;
  color: string;
}

interface IncidentStatusChartProps {
  data?: IncidentStatusData[];
  title?: string;
  height?: number;
}

const defaultData: IncidentStatusData[] = [
  { status: "Open", count: 15, color: "#f44336" },
  { status: "In Progress", count: 8, color: "#ff9800" },
  { status: "Under Review", count: 5, color: "#2196f3" },
  { status: "Closed", count: 42, color: "#4caf50" },
];

const IncidentStatusChart: React.FC<IncidentStatusChartProps> = ({
  data = defaultData,
  title = "Incident Status Distribution",
  height = 300,
}) => {
  const renderCustomizedLabel = (entry: any) => {
    const percent = (
      (entry.count / data.reduce((sum, item) => sum + item.count, 0)) *
      100
    ).toFixed(1);
    return `${percent}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
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
            {data.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {renderCustomizedLabel(data)}
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
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: "50%",
                  mr: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.status}: {item.count}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default IncidentStatusChart;
