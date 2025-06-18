import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from '../contexts/AuthContext'; // Removed unused import (TS6133 Fix)
import { useToast } from "../contexts/ToastContext";

interface Report {
  id: string;
  title: string;
  date: string;
  author: string;
  status: "pending" | "approved" | "rejected";
  type: string;
}

const DailyReports: React.FC = () => {
  // const { user } = useAuth(); // Removed unused variable (TS6133 Fix)
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Load reports data (Expanded for scrolling test)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockReports: Report[] = [
        {
          id: "DR-001",
          title: "Daily Safety Inspection - Building A",
          date: "2025-05-22",
          author: "John Smith",
          status: "approved",
          type: "inspection",
        },
        {
          id: "DR-002",
          title: "Equipment Check - Forklift #3",
          date: "2025-05-22",
          author: "Emma Clark",
          status: "pending",
          type: "equipment",
        },
        {
          id: "DR-003",
          title: "Fire Safety Drill Report",
          date: "2025-05-21",
          author: "Michael Johnson",
          status: "approved",
          type: "drill",
        },
        {
          id: "DR-004",
          title: "Chemical Storage Inspection",
          date: "2025-05-21",
          author: "Sarah Williams",
          status: "rejected",
          type: "inspection",
        },
        {
          id: "DR-005",
          title: "PPE Compliance Check",
          date: "2025-05-20",
          author: "David Brown",
          status: "approved",
          type: "compliance",
        },
        {
          id: "DR-006",
          title: "Emergency Exit Test - Floor 2",
          date: "2025-05-20",
          author: "John Smith",
          status: "approved",
          type: "test",
        },
        {
          id: "DR-007",
          title: "First Aid Kit Restock - Office Wing",
          date: "2025-05-19",
          author: "Emma Clark",
          status: "pending",
          type: "maintenance",
        },
        {
          id: "DR-008",
          title: "Hazard Observation - Warehouse",
          date: "2025-05-19",
          author: "Michael Johnson",
          status: "approved",
          type: "observation",
        },
      ];
      setReports(mockReports);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter reports based on search term and status filter
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Handle view report
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

  // Handle download report
  const handleDownloadReport = (report: Report) => {
    addToast({
      type: "info",
      title: "Downloading Report",
      message: `Preparing ${report.title} for download...`,
      duration: 2000,
    });
    setTimeout(() => {
      // Simulate PDF generation
      const blob = new Blob(
        [`Daily Report Content for ${report.title} (${report.date})`],
        { type: "application/pdf" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "_")}_${report.date}.pdf`;
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

  // Handle navigate to create report
  const handleCreateReport = () => {
    navigate("/report-creator");
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  // Get status badge class
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

  // Close report modal
  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Daily Reports</h1>
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
                      <th>ID</th>
                      <th>Title</th>
                      <th>Date</th>
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
                        <td>{report.date}</td>
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

      {/* Report Modal */}
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
                  <div className="detail-label">Date:</div>
                  <div className="detail-value">{selectedReport.date}</div>
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
                  <li>Executive summary</li>
                  <li>Findings and observations</li>
                  <li>Compliance status</li>
                  <li>Recommendations</li>
                  <li>Action items</li>
                </ul>
                <p>
                  The report would also include any relevant images, charts, or
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

export default DailyReports;
