import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from '../contexts/AuthContext'; // Removed unused import (TS6133 Fix)
import { useToast } from "../contexts/ToastContext";

// Consistent Report Interface
interface Report {
  id: string;
  title: string;
  month: string; // Specific to Monthly
  author: string;
  status: "pending" | "approved" | "rejected";
  type: string;
}

// Placeholder for Performance Metrics Data (Consistent with Weekly)
interface PerformanceMetricsData {
  reportsSubmitted: number;
  complianceRate: number;
  overdueTasks: number;
  incidentsReported: number;
}

const MonthlyReports: React.FC = () => {
  // const { user } = useAuth(); // Removed unused variable (TS6133 Fix)
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetricsData | null>(null);

  // Load reports and performance metrics data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API calls
    const reportsPromise = new Promise<Report[]>((resolve) => {
      setTimeout(() => {
        const mockReports: Report[] = [
          {
            id: "MR-001",
            title: "Monthly Safety Performance - May 2025",
            month: "May 2025",
            author: "Safety Committee",
            status: "pending",
            type: "performance",
          },
          {
            id: "MR-002",
            title: "Monthly Compliance Audit - May 2025",
            month: "May 2025",
            author: "Internal Audit",
            status: "pending",
            type: "audit",
          },
          {
            id: "MR-003",
            title: "Monthly Training Summary - April 2025",
            month: "April 2025",
            author: "Training Dept.",
            status: "approved",
            type: "training",
          },
          {
            id: "MR-004",
            title: "Monthly Incident Analysis - April 2025",
            month: "April 2025",
            author: "Incident Response Team",
            status: "approved",
            type: "analysis",
          },
          {
            id: "MR-005",
            title: "Monthly Equipment Maintenance - April 2025",
            month: "April 2025",
            author: "Maintenance Dept.",
            status: "rejected",
            type: "maintenance",
          },
          {
            id: "MR-006",
            title: "Monthly Hazard Assessment - March 2025",
            month: "March 2025",
            author: "Safety Committee",
            status: "approved",
            type: "assessment",
          },
          {
            id: "MR-007",
            title: "Monthly PPE Review - March 2025",
            month: "March 2025",
            author: "Procurement",
            status: "approved",
            type: "review",
          },
          {
            id: "MR-008",
            title: "Monthly Safety Meeting Minutes - February 2025",
            month: "February 2025",
            author: "Admin",
            status: "approved",
            type: "minutes",
          },
        ];
        resolve(mockReports);
      }, 800);
    });

    const metricsPromise = new Promise<PerformanceMetricsData>((resolve) => {
      setTimeout(() => {
        // Mock Monthly Metrics (might differ from weekly)
        const mockMetrics: PerformanceMetricsData = {
          reportsSubmitted: 65,
          complianceRate: 94,
          overdueTasks: 2,
          incidentsReported: 4,
        };
        resolve(mockMetrics);
      }, 600); // Slightly faster for metrics
    });

    Promise.all([reportsPromise, metricsPromise]).then(
      ([loadedReports, loadedMetrics]) => {
        setReports(loadedReports);
        setPerformanceMetrics(loadedMetrics);
        setIsLoading(false);
      },
    );
  }, []);

  // Filter reports (Consistent)
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Handle view report (Consistent)
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    addToast({
      type: "info",
      title: "Report Opened",
      message: `Viewing report: ${report.title}`,
      duration: 3000,
    });
  };

  // Handle download report (Consistent)
  const handleDownloadReport = (report: Report) => {
    addToast({
      type: "info",
      title: "Downloading Report",
      message: `Preparing ${report.title} for download...`,
      duration: 2000,
    });
    setTimeout(() => {
      const blob = new Blob(
        [`Monthly Report Content for ${report.title} (${report.month})`],
        { type: "application/pdf" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "_")}_${report.month.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        type: "success",
        title: "Download Complete",
        message: `${report.title} has been downloaded successfully`,
        duration: 3000,
      });
    }, 2000);
  };

  // Handle navigate to create report (Consistent)
  const handleCreateReport = () => {
    navigate("/report-creator");
  };

  // Handle search (Consistent)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change (Consistent)
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  // Get status badge class (Consistent)
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "approved":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      case "pending":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  // Close report modal (Consistent)
  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Monthly Reports</h1>
        <div className="dashboard-actions">
          <button
            className="dashboard-button primary"
            onClick={handleCreateReport}
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
            Create Report
          </button>
        </div>
      </div>

      {/* Performance Metrics Section (Consistent with Weekly) */}
      {performanceMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">
              {performanceMetrics.reportsSubmitted}
            </div>
            <div className="metric-label">Reports Submitted</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {performanceMetrics.complianceRate}%
            </div>
            <div className="metric-label">Compliance Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {performanceMetrics.overdueTasks}
            </div>
            <div className="metric-label">Overdue Tasks</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {performanceMetrics.incidentsReported}
            </div>
            <div className="metric-label">Incidents Reported</div>
          </div>
        </div>
      )}

      {/* Filter Container (Consistent) */}
      <div className="filter-container">
        <div className="search-box">
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-box">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <div className="loader-text">Loading reports...</div>
        </div>
      ) : (
        <>
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3>No reports found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="dashboard-button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="table-container">
              {/* Add scrollable container for the table body */}
              <div
                className="table-scroll-container"
                style={{ maxHeight: "calc(5 * 50px)", overflowY: "auto" }}
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      {/* Consistent Columns */}
                      <th>ID</th>
                      <th>Title</th>
                      <th>Month</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>{report.title}</td>
                        <td>{report.month}</td>
                        <td>{report.author}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(report.status)}`}
                          >
                            {report.status.charAt(0).toUpperCase() +
                              report.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button tooltip"
                              onClick={() => handleViewReport(report)}
                              aria-label="View report"
                            >
                              <span className="tooltip-content">View</span>
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
                              className="action-button tooltip"
                              onClick={() => handleDownloadReport(report)}
                              aria-label="Download report"
                            >
                              <span className="tooltip-content">Download</span>
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
                            <button
                              className="action-button tooltip disabled"
                              aria-label="Edit report (coming soon)"
                            >
                              <span className="tooltip-content">
                                Edit (coming soon)
                              </span>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Modal (Consistent Structure) */}
      {showReportModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{selectedReport.title}</h2>
              <button
                className="modal-close"
                onClick={closeReportModal}
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="report-details">
                <div className="detail-row">
                  <div className="detail-label">Report ID:</div>
                  <div className="detail-value">{selectedReport.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Month:</div>
                  <div className="detail-value">{selectedReport.month}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Author:</div>
                  <div className="detail-value">{selectedReport.author}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value">
                    <span
                      className={`badge ${getStatusBadgeClass(selectedReport.status)}`}
                    >
                      {selectedReport.status.charAt(0).toUpperCase() +
                        selectedReport.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Type:</div>
                  <div className="detail-value">
                    {selectedReport.type.charAt(0).toUpperCase() +
                      selectedReport.type.slice(1)}
                  </div>
                </div>
              </div>

              <div className="report-content">
                <h3>Report Content</h3>
                <p>
                  This is a placeholder for the actual report content. In a
                  production environment, this would display the full report
                  details, including:
                </p>
                <ul>
                  <li>Key performance indicators (KPIs)</li>
                  <li>Trend analysis</li>
                  <li>Compliance summary</li>
                  <li>Recommendations for improvement</li>
                  <li>Action plan updates</li>
                </ul>
                <p>
                  The report would also include any relevant charts, graphs, or
                  attachments.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="dashboard-button" onClick={closeReportModal}>
                Close
              </button>
              <button
                className="dashboard-button primary"
                onClick={() => handleDownloadReport(selectedReport)}
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
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReports;
