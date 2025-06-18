import React, { useState } from "react";

interface DashboardProps {} // eslint-disable-line @typescript-eslint/no-empty-interface
// Define the DashboardProps interface if you need to pass props in the future

const Dashboard: React.FC<DashboardProps> = () => {
  // Keep state variables but remove setters that aren't used
  const [activeProcedures] = useState<number>(24);
  const [openRiskReports] = useState<number>(3);
  const [complianceScore] = useState<number>(92);
  const [safetyMeetings] = useState<number>(8);
  const [timeRange, setTimeRange] = useState<string>("7d");

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-actions">
          <select
            className="form-control auto-width"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            title="Select time range"
          >
            {/* ... */}
          </select>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Active Procedures</h3>
            <div className="metric-value">
              <span className="value">{activeProcedures}</span>
              <span className="trend positive">+2</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
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
            <h3>Open Risk Reports</h3>
            <div className="metric-value">
              <span className="value">{openRiskReports}</span>
              <span className="trend negative">+1</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
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
            <h3>Compliance Score</h3>
            <div className="metric-value">
              <span className="value">{complianceScore}%</span>
              <span className="trend positive">+2%</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="metric-content">
            <h3>Safety Meetings</h3>
            <div className="metric-value">
              <span className="value">{safetyMeetings}</span>
              <span className="trend neutral">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Recent Incidents</div>
            <div className="card-actions">
              <button
                className="card-action-button"
                title="More actions"
                aria-label="More actions"
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
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="incident-list">
              <div className="incident-item">
                <div className="incident-severity high"></div>
                <div className="incident-content">
                  <div className="incident-title">Equipment Malfunction</div>
                  <div className="incident-details">
                    <span className="incident-location">
                      Building A, Floor 2
                    </span>
                    <span className="incident-time">Today, 10:23 AM</span>
                  </div>
                </div>
                <div className="incident-status">
                  <span className="badge badge-warning">In Progress</span>
                </div>
              </div>

              <div className="incident-item">
                <div className="incident-severity medium"></div>
                <div className="incident-content">
                  <div className="incident-title">Minor Chemical Spill</div>
                  <div className="incident-details">
                    <span className="incident-location">Lab 3</span>
                    <span className="incident-time">Yesterday, 3:45 PM</span>
                  </div>
                </div>
                <div className="incident-status">
                  <span className="badge badge-success">Resolved</span>
                </div>
              </div>

              <div className="incident-item">
                <div className="incident-severity low"></div>
                <div className="incident-content">
                  <div className="incident-title">Blocked Emergency Exit</div>
                  <div className="incident-details">
                    <span className="incident-location">Warehouse B</span>
                    <span className="incident-time">Yesterday, 9:12 AM</span>
                  </div>
                </div>
                <div className="incident-status">
                  <span className="badge badge-success">Resolved</span>
                </div>
              </div>

              <div className="incident-item">
                <div className="incident-severity high"></div>
                <div className="incident-content">
                  <div className="incident-title">Power Outage</div>
                  <div className="incident-details">
                    <span className="incident-location">Main Building</span>
                    <span className="incident-time">May 16, 2025</span>
                  </div>
                </div>
                <div className="incident-status">
                  <span className="badge badge-success">Resolved</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="btn btn-link">View All Incidents</button>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Upcoming Safety Meetings</div>
            <div className="card-actions">
              <button
                className="card-action-button"
                title="More actions"
                aria-label="More actions"
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
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="meeting-list">
              <div className="meeting-item">
                <div className="meeting-date">
                  <div className="date-day">21</div>
                  <div className="date-month">May</div>
                </div>
                <div className="meeting-content">
                  <div className="meeting-title">Monthly Safety Review</div>
                  <div className="meeting-details">
                    <span className="meeting-time">10:00 AM - 11:30 AM</span>
                    <span className="meeting-location">Conference Room A</span>
                  </div>
                </div>
                <div className="meeting-actions">
                  <button
                    className="meeting-action-button"
                    title="View meeting details"
                    aria-label="View meeting details"
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
                      <path d="M10 14l2 2 4-4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="meeting-item">
                <div className="meeting-date">
                  <div className="date-day">23</div>
                  <div className="date-month">May</div>
                </div>
                <div className="meeting-content">
                  <div className="meeting-title">New Equipment Training</div>
                  <div className="meeting-details">
                    <span className="meeting-time">2:00 PM - 4:00 PM</span>
                    <span className="meeting-location">Training Room B</span>
                  </div>
                </div>
                <div className="meeting-actions">
                  <button
                    className="meeting-action-button"
                    title="View meeting details"
                    aria-label="View meeting details"
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
                      <path d="M10 14l2 2 4-4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="meeting-item">
                <div className="meeting-date">
                  <div className="date-day">25</div>
                  <div className="date-month">May</div>
                </div>
                <div className="meeting-content">
                  <div className="meeting-title">Emergency Response Drill</div>
                  <div className="meeting-details">
                    <span className="meeting-time">9:00 AM - 10:30 AM</span>
                    <span className="meeting-location">All Departments</span>
                  </div>
                </div>
                <div className="meeting-actions">
                  <button
                    className="meeting-action-button"
                    title="View meeting details"
                    aria-label="View meeting details"
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
                      <path d="M10 14l2 2 4-4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="meeting-item">
                <div className="meeting-date">
                  <div className="date-day">28</div>
                  <div className="date-month">May</div>
                </div>
                <div className="meeting-content">
                  <div className="meeting-title">Safety Committee Meeting</div>
                  <div className="meeting-details">
                    <span className="meeting-time">1:00 PM - 2:30 PM</span>
                    <span className="meeting-location">Conference Room C</span>
                  </div>
                </div>
                <div className="meeting-actions">
                  <button
                    className="meeting-action-button"
                    title="View meeting details"
                    aria-label="View meeting details"
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
                      <path d="M10 14l2 2 4-4"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="btn btn-link">View All Meetings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Safety Performance</div>
            <div className="card-actions">
              <button
                className="card-action-button"
                title="More actions"
                aria-label="More actions"
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
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="performance-chart">
              <div className="chart-placeholder">
                <div className="chart-bar chart-bar-60"></div>
                <div className="chart-bar chart-bar-75"></div>
                <div className="chart-bar chart-bar-65"></div>
                <div className="chart-bar chart-bar-80"></div>
                <div className="chart-bar chart-bar-90"></div>
                <div className="chart-bar chart-bar-92 active"></div>
              </div>
              <div className="chart-labels">
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
            <div className="performance-legend">
              <div className="legend-item">
                <div className="legend-color"></div>
                <div className="legend-label">Compliance Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          <div className="card-content">
            <div className="quick-actions">
              <button className="quick-action-button">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span>New Report</span>
              </button>

              <button className="quick-action-button">
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
                <span>Report Incident</span>
              </button>

              <button className="quick-action-button">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Schedule Meeting</span>
              </button>

              <button className="quick-action-button">
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Assign Task</span>
              </button>

              <button className="quick-action-button">
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload Document</span>
              </button>

              <button className="quick-action-button">
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
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Add Equipment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
