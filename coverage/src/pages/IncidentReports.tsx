import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Assuming AuthContext is available
import { useToast } from "../contexts/ToastContext"; // Assuming ToastContext is available

interface Incident {
  id: string;
  title: string;
  location: string;
  date: string;
  severity: "Low" | "Medium" | "High"; // Use specific types
  status: "Open" | "In Progress" | "Resolved" | "Closed"; // Use specific types
}

const IncidentReports: React.FC = () => {
  const { userRole } = useAuth();
  const { addToast } = useToast();
  const [incidents] = useState<Incident[]>([
    {
      id: "1",
      title: "Equipment Malfunction",
      location: "Building A, Floor 2",
      date: "May 19, 2025",
      severity: "High",
      status: "In Progress",
    },
    {
      id: "2",
      title: "Minor Chemical Spill",
      location: "Lab 3",
      date: "May 18, 2025",
      severity: "Medium",
      status: "Resolved",
    },
    {
      id: "3",
      title: "Blocked Emergency Exit",
      location: "Warehouse B",
      date: "May 18, 2025",
      severity: "Low",
      status: "Resolved",
    },
    {
      id: "4",
      title: "Power Outage",
      location: "Main Building",
      date: "May 16, 2025",
      severity: "High",
      status: "Resolved",
    },
    {
      id: "5",
      title: "Slip and Fall",
      location: "Cafeteria",
      date: "May 15, 2025",
      severity: "Medium",
      status: "Resolved",
    },
    {
      id: "6",
      title: "Near Miss - Falling Object",
      location: "Construction Site Zone 1",
      date: "May 20, 2025",
      severity: "Low",
      status: "Closed",
    },
    {
      id: "7",
      title: "Incorrect PPE Usage",
      location: "Workshop C",
      date: "May 21, 2025",
      severity: "Medium",
      status: "Open",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const severityOptions = ["All", "Low", "Medium", "High"];
  const statusOptions = ["All", "Open", "In Progress", "Resolved", "Closed"];

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      incident.title.toLowerCase().includes(lowerSearchTerm) ||
      incident.location.toLowerCase().includes(lowerSearchTerm) ||
      incident.id.toLowerCase().includes(lowerSearchTerm);
    const matchesSeverity =
      selectedSeverity === "All" || incident.severity === selectedSeverity;
    const matchesStatus =
      selectedStatus === "All" || incident.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Handle download functionality
  const handleDownload = (incidentId: string): void => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident) {
      addToast({
        type: "info",
        title: "Generating Report",
        message: `Preparing PDF for incident ${incident.title}...`,
      });
      // Simulate PDF generation
      setTimeout(() => {
        const blob = new Blob(
          [
            `Incident Report\n------------------\nID: ${incident.id}\nTitle: ${incident.title}\nLocation: ${incident.location}\nDate: ${incident.date}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\n\nDetails: [Placeholder for full report details]`,
          ],
          { type: "application/pdf" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Incident_Report_${incident.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast({
          type: "success",
          title: "Report Downloaded",
          message: `PDF for incident ${incident.title} downloaded.`,
        });
      }, 1000);
    }
  };

  // Handle Report Incident (Placeholder)
  const handleReportIncident = () => {
    addToast({
      type: "info",
      title: "Report Incident",
      message: "Navigating to incident reporting form (not implemented).",
    });
    // In a real app, navigate to a form: navigate('/incidents/report');
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "badge-success";
      case "In Progress":
      case "Open":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  // Get severity badge class
  const getSeverityBadgeClass = (severity: string): string => {
    switch (severity) {
      case "Low":
        return "badge-info";
      case "Medium":
        return "badge-warning";
      case "High":
        return "badge-error";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="dashboard-container incident-reports">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Incident Reports</h1>
        <div className="dashboard-actions">
          <button
            className="dashboard-button primary"
            onClick={handleReportIncident}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Report New Incident
          </button>
        </div>
      </div>

      {/* Filters Section - Moved search here for consistency */}
      <div className="dashboard-filters">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search incidents by title, location, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" aria-label="Search">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div className="filter-group">
          <label htmlFor="severityFilter">Severity:</label>
          <select
            id="severityFilter"
            className="filter-select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Recent Incidents</div>
          {/* Search moved to filters section */}
        </div>
        <div className="card-content no-padding">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Incident Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state-row">
                      No incidents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>{incident.title}</td>
                      <td>{incident.location}</td>
                      <td>{incident.date}</td>
                      <td>
                        <span
                          className={`badge ${getSeverityBadgeClass(incident.severity)}`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(incident.status)}`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button"
                            title="View Details"
                            onClick={() =>
                              addToast({
                                type: "info",
                                title: "View Incident",
                                message: `Viewing details for incident ${incident.id} (not implemented).`,
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button
                            className="action-button"
                            title="Download Report"
                            onClick={() => handleDownload(incident.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </button>
                          {/* Show Edit button only if status is Open or In Progress */}
                          {(incident.status === "Open" ||
                            incident.status === "In Progress") && (
                            <button
                              className="action-button"
                              title="Edit Incident"
                              onClick={() =>
                                addToast({
                                  type: "info",
                                  title: "Edit Incident",
                                  message: `Editing incident ${incident.id} (not implemented).`,
                                })
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                          )}
                          {/* Admin-only action example (e.g., Close Incident) */}
                          {userRole === "admin" &&
                            incident.status !== "Closed" &&
                            incident.status !== "Resolved" && (
                              <button
                                className="action-button"
                                title="Close Incident"
                                onClick={() =>
                                  addToast({
                                    type: "info",
                                    title: "Close Incident",
                                    message: `Closing incident ${incident.id} (not implemented).`,
                                  })
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Incident Statistics Section - Kept as is */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Incident Statistics (YTD)</div>
        </div>
        <div className="card-content">
          <div className="dashboard-metrics">
            <div className="metric-card info">
              <div className="metric-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Total Incidents</h3>
                <div className="metric-value">
                  <span className="value">12</span>
                  <span className="trend positive">-25%</span>
                </div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Open Incidents</h3>
                <div className="metric-value">
                  <span className="value">1</span>
                  <span className="trend neutral">0</span>
                </div>
              </div>
            </div>

            <div className="metric-card default">
              <div className="metric-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Avg. Resolution Time</h3>
                <div className="metric-value">
                  <span className="value">1.8 days</span>
                  <span className="trend positive">-0.5 days</span>
                </div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Resolution Rate</h3>
                <div className="metric-value">
                  <span className="value">98%</span>
                  <span className="trend positive">+3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Add specific styles if needed, otherwise rely on App.css */
        .incident-reports .dashboard-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center; /* Align items vertically */
        }
        .incident-reports .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .incident-reports .filter-group label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .incident-reports .filter-select {
          padding: 0.5rem 0.75rem;
          border-radius: var(--border-radius-small);
          border: 1px solid var(--border-color);
          background-color: var(--input-bg);
          color: var(--text-primary);
          min-width: 120px; /* Ensure selects have some width */
        }
        .incident-reports .search-container {
          flex-grow: 1; /* Allow search to take available space */
          max-width: 400px; /* Limit max width */
        }
        .incident-reports .table-container {
          overflow-x: auto;
        }
        .incident-reports .data-table .badge {
          text-transform: capitalize;
        }
        .incident-reports .data-table .badge-low { background-color: var(--info-light); color: var(--info-dark); }
        .incident-reports .data-table .badge-medium { background-color: var(--warning-light); color: var(--warning-dark); }
        .incident-reports .data-table .badge-high { background-color: var(--error-light); color: var(--error-dark); }
      `}</style>
    </div>
  );
};

export default IncidentReports;
