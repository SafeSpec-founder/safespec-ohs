import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { Visibility, Edit, Schedule, Warning } from "@mui/icons-material";
import { format, isAfter, parseISO } from "date-fns";

interface UpcomingAction {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status:
    | "Not Started"
    | "In Progress"
    | "Under Review"
    | "Completed"
    | "Overdue";
  assignedTo: string;
  dueDate: string;
  progress: number;
  relatedIncident?: string;
  category: "Corrective" | "Preventive" | "Maintenance" | "Training" | "Audit";
}

interface UpcomingActionsTableProps {
  actions?: UpcomingAction[];
  title?: string;
  maxRows?: number;
  onViewAction?: (id: string) => void;
  onEditAction?: (id: string) => void;
}

const defaultActions: UpcomingAction[] = [
  {
    id: "1",
    title: "Install safety barriers",
    description: "Install additional safety barriers in warehouse area",
    priority: "High",
    status: "In Progress",
    assignedTo: "Maintenance Team",
    dueDate: "2024-01-20T17:00:00Z",
    progress: 65,
    relatedIncident: "INC-001",
    category: "Corrective",
  },
  {
    id: "2",
    title: "Chemical handling training",
    description: "Conduct chemical handling safety training for lab staff",
    priority: "Critical",
    status: "Not Started",
    assignedTo: "Safety Officer",
    dueDate: "2024-01-18T09:00:00Z",
    progress: 0,
    relatedIncident: "INC-002",
    category: "Training",
  },
  {
    id: "3",
    title: "Equipment inspection",
    description: "Monthly safety inspection of production equipment",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Quality Team",
    dueDate: "2024-01-25T16:00:00Z",
    progress: 30,
    category: "Maintenance",
  },
  {
    id: "4",
    title: "Update safety procedures",
    description: "Review and update forklift operation procedures",
    priority: "Medium",
    status: "Under Review",
    assignedTo: "Safety Committee",
    dueDate: "2024-01-22T12:00:00Z",
    progress: 80,
    category: "Preventive",
  },
  {
    id: "5",
    title: "Fire system maintenance",
    description: "Quarterly fire alarm system maintenance and testing",
    priority: "High",
    status: "Overdue",
    assignedTo: "Facilities Team",
    dueDate: "2024-01-15T14:00:00Z",
    progress: 10,
    category: "Maintenance",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "error";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    case "Low":
      return "success";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Not Started":
      return "default";
    case "In Progress":
      return "info";
    case "Under Review":
      return "warning";
    case "Completed":
      return "success";
    case "Overdue":
      return "error";
    default:
      return "default";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Corrective":
      return "#f44336";
    case "Preventive":
      return "#2196f3";
    case "Maintenance":
      return "#ff9800";
    case "Training":
      return "#4caf50";
    case "Audit":
      return "#9c27b0";
    default:
      return "#757575";
  }
};

const isOverdue = (dueDate: string) => {
  return isAfter(new Date(), parseISO(dueDate));
};

const UpcomingActionsTable: React.FC<UpcomingActionsTableProps> = ({
  actions = defaultActions,
  title = "Upcoming Actions",
  maxRows = 5,
  onViewAction,
  onEditAction,
}) => {
  const displayedActions = actions.slice(0, maxRows);

  const handleViewAction = (id: string) => {
    if (onViewAction) {
      onViewAction(id);
    }
  };

  const handleEditAction = (id: string) => {
    if (onEditAction) {
      onEditAction(id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {displayedActions.length} of {actions.length}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedActions.map((action) => (
                <TableRow key={action.id} hover>
                  <TableCell>
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: getCategoryColor(action.category),
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {action.title}
                        </Typography>
                        {isOverdue(action.dueDate) &&
                          action.status !== "Completed" && (
                            <Warning
                              color="error"
                              sx={{ ml: 1, fontSize: 16 }}
                            />
                          )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {action.description}
                      </Typography>
                      {action.relatedIncident && (
                        <Typography
                          variant="caption"
                          color="primary"
                          display="block"
                        >
                          Related: {action.relatedIncident}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.priority}
                      color={getPriorityColor(action.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.status}
                      color={getStatusColor(action.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 100,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={action.progress}
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <Typography variant="caption">
                        {action.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          mr: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {action.assignedTo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Typography variant="body2">
                        {action.assignedTo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Schedule
                        sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {format(parseISO(action.dueDate), "MMM dd, yyyy")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(parseISO(action.dueDate), "HH:mm")}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewAction(action.id)}
                        title="View action"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAction(action.id)}
                        title="Edit action"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {actions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No upcoming actions to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingActionsTable;
