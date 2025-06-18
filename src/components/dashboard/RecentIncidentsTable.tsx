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
} from "@mui/material";
import { Visibility, Edit, MoreVert } from "@mui/icons-material";
import { format } from "date-fns";

interface RecentIncident {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Under Review" | "Closed";
  reportedBy: string;
  reportedAt: string;
  location: string;
  assignedTo?: string;
}

interface RecentIncidentsTableProps {
  incidents?: RecentIncident[];
  title?: string;
  maxRows?: number;
  onViewIncident?: (id: string) => void;
  onEditIncident?: (id: string) => void;
}

const defaultIncidents: RecentIncident[] = [
  {
    id: "1",
    title: "Slip and fall in warehouse",
    severity: "Medium",
    status: "In Progress",
    reportedBy: "John Smith",
    reportedAt: "2024-01-15T10:30:00Z",
    location: "Warehouse A",
    assignedTo: "Safety Team",
  },
  {
    id: "2",
    title: "Chemical spill in lab",
    severity: "High",
    status: "Under Review",
    reportedBy: "Sarah Johnson",
    reportedAt: "2024-01-14T14:15:00Z",
    location: "Laboratory B",
    assignedTo: "Environmental Team",
  },
  {
    id: "3",
    title: "Equipment malfunction",
    severity: "Critical",
    status: "Open",
    reportedBy: "Mike Wilson",
    reportedAt: "2024-01-14T09:45:00Z",
    location: "Production Floor",
    assignedTo: "Maintenance Team",
  },
  {
    id: "4",
    title: "Near miss - forklift",
    severity: "Low",
    status: "Closed",
    reportedBy: "Lisa Brown",
    reportedAt: "2024-01-13T16:20:00Z",
    location: "Loading Dock",
  },
  {
    id: "5",
    title: "Fire alarm malfunction",
    severity: "High",
    status: "In Progress",
    reportedBy: "David Lee",
    reportedAt: "2024-01-13T11:10:00Z",
    location: "Office Building",
    assignedTo: "Facilities Team",
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
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
    case "Open":
      return "error";
    case "In Progress":
      return "warning";
    case "Under Review":
      return "info";
    case "Closed":
      return "success";
    default:
      return "default";
  }
};

const RecentIncidentsTable: React.FC<RecentIncidentsTableProps> = ({
  incidents = defaultIncidents,
  title = "Recent Incidents",
  maxRows = 5,
  onViewIncident,
  onEditIncident,
}) => {
  const displayedIncidents = incidents.slice(0, maxRows);

  const handleViewIncident = (id: string) => {
    if (onViewIncident) {
      onViewIncident(id);
    }
  };

  const handleEditIncident = (id: string) => {
    if (onEditIncident) {
      onEditIncident(id);
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
            Showing {displayedIncidents.length} of {incidents.length}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Incident</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedIncidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {incident.title}
                      </Typography>
                      {incident.assignedTo && (
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {incident.assignedTo}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={incident.severity}
                      color={getSeverityColor(incident.severity) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      color={getStatusColor(incident.status) as any}
                      size="small"
                    />
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
                        {incident.reportedBy
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Typography variant="body2">
                        {incident.reportedBy}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(incident.reportedAt), "MMM dd, yyyy")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(incident.reportedAt), "HH:mm")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{incident.location}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewIncident(incident.id)}
                        title="View incident"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditIncident(incident.id)}
                        title="Edit incident"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="More options">
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {incidents.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No recent incidents to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentIncidentsTable;
