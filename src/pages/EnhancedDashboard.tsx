import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
// Placeholder for charting library - choose one like Recharts or Chart.js
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define interfaces for state
interface SafetyMetrics {
  incidentRate: number;
  nearMisses: number;
  safetyObservations: number;
  complianceRate: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
}

// Removed unused placeholder data variables (incidentData, complianceData) - TS6133 Fix

const EnhancedDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [safetyMetrics] = useState<SafetyMetrics>({
    incidentRate: 1.2,
    nearMisses: 8,
    safetyObservations: 42,
    complianceRate: 96,
  });
  const [upcomingMeetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Safety Committee Meeting",
      date: "Today, 2:00 PM",
      location: "Conference Room A",
      attendees: 8,
    },
    {
      id: "2",
      title: "Emergency Response Drill",
      date: "Tomorrow, 10:00 AM",
      location: "Main Facility",
      attendees: 25,
    },
    {
      id: "3",
      title: "Hazard Assessment Review",
      date: "May 22, 2025, 1:30 PM",
      location: "Conference Room B",
      attendees: 6,
    },
  ]);

  // Refs for dropdowns
  const incidentExportRef = useRef<HTMLDivElement>(null);
  const complianceExportRef = useRef<HTMLDivElement>(null);
  const incidentExportButtonRef = useRef<HTMLButtonElement>(null);
  const complianceExportButtonRef = useRef<HTMLButtonElement>(null);

  const [incidentExportOpen, setIncidentExportOpen] = useState(false);
  const [complianceExportOpen, setComplianceExportOpen] = useState(false);

  // Handle chart expansion
  const toggleChartExpansion = (chartId: string): void => {
    setExpandedChart((prev) => (prev === chartId ? null : chartId));
  };

  // Export chart data (Placeholder - Needs actual implementation)
  const exportChart = (chartId: string, format: string): void => {
    console.log(`Exporting chart ${chartId} in ${format} format`);
    // TODO: Implement actual export logic (e.g., using html2canvas for PNG, jsPDF for PDF, or data-to-CSV)
    // Close dropdown after selection
    if (chartId === "incidents") setIncidentExportOpen(false);
    if (chartId === "compliance") setComplianceExportOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        incidentExportRef.current &&
        !incidentExportRef.current.contains(event.target as Node) &&
        !incidentExportButtonRef.current?.contains(event.target as Node)
      ) {
        setIncidentExportOpen(false);
      }
      if (
        complianceExportRef.current &&
        !complianceExportRef.current.contains(event.target as Node) &&
        !complianceExportButtonRef.current?.contains(event.target as Node)
      ) {
        setComplianceExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for dropdowns
  const handleDropdownKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLDivElement>,
      type: "incidents" | "compliance",
    ) => {
      const menuRef =
        type === "incidents" ? incidentExportRef : complianceExportRef;
      const buttonRef =
        type === "incidents"
          ? incidentExportButtonRef
          : complianceExportButtonRef;
      const setOpen =
        type === "incidents" ? setIncidentExportOpen : setComplianceExportOpen;

      if (!menuRef.current) return;

      const items = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(".dropdown-menu button"),
      );
      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement,
      );

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const nextIndex =
            currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
          items[nextIndex]?.focus();
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const prevIndex =
            currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex]?.focus();
          break;
        }
        case "Enter":
        case " ":
          if (
            document.activeElement &&
            items.includes(document.activeElement as HTMLElement)
          ) {
            event.preventDefault();
            (document.activeElement as HTMLElement).click();
          }
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          buttonRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [],
  );

  // Focus first item when dropdown opens
  useEffect(() => {
    if (incidentExportOpen && incidentExportRef.current) {
      incidentExportRef.current
        .querySelector<HTMLElement>(".dropdown-menu button")
        ?.focus();
    }
  }, [incidentExportOpen]);

  useEffect(() => {
    if (complianceExportOpen && complianceExportRef.current) {
      complianceExportRef.current
        .querySelector<HTMLElement>(".dropdown-menu button")
        ?.focus();
    }
  }, [complianceExportOpen]);

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Safety Dashboard</h1>
        <div className="dashboard-actions">
          <label htmlFor="timeRangeSelect" className="sr-only">
            Select Time Range
          </label>{" "}
          {/* Accessibility */}
          <select
            id="timeRangeSelect"
            className="form-control"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Metrics Section with ARIA roles */}
      <section aria-labelledby="metrics-heading" className="dashboard-metrics">
        <h2 id="metrics-heading" className="sr-only">
          Key Safety Metrics
        </h2>
        {/* Incident Rate Card */}
        <div
          className="metric-card"
          role="region"
          aria-labelledby="incident-rate-heading"
        >
          <div className="metric-icon" aria-hidden="true">
            {/* SVG */}
          </div>
          <div className="metric-content">
            <h3 id="incident-rate-heading">Incident Rate</h3>
            <div className="metric-value">
              <span className="value">{safetyMetrics.incidentRate}</span>
              <span className="trend positive" aria-label="Decrease of 0.3">
                -0.3
              </span>
            </div>
          </div>
        </div>
        {/* Compliance Rate Card */}
        <div
          className="metric-card"
          role="region"
          aria-labelledby="compliance-rate-heading"
        >
          <div className="metric-icon" aria-hidden="true">
            {/* SVG */}
          </div>
          <div className="metric-content">
            <h3 id="compliance-rate-heading">Compliance Rate</h3>
            <div className="metric-value">
              <span className="value">{safetyMetrics.complianceRate}%</span>
              <span
                className="trend positive"
                aria-label="Increase of 2 percent"
              >
                +2%
              </span>
            </div>
          </div>
        </div>
        {/* Near Misses Card */}
        <div
          className="metric-card"
          role="region"
          aria-labelledby="near-misses-heading"
        >
          <div className="metric-icon" aria-hidden="true">
            {/* SVG */}
          </div>
          <div className="metric-content">
            <h3 id="near-misses-heading">Near Misses</h3>
            <div className="metric-value">
              <span className="value">{safetyMetrics.nearMisses}</span>
              <span className="trend negative" aria-label="Increase of 2">
                +2
              </span>
            </div>
          </div>
        </div>
        {/* Safety Observations Card */}
        <div
          className="metric-card"
          role="region"
          aria-labelledby="safety-observations-heading"
        >
          <div className="metric-icon" aria-hidden="true">
            {/* SVG */}
          </div>
          <div className="metric-content">
            <h3 id="safety-observations-heading">Safety Observations</h3>
            <div className="metric-value">
              <span className="value">{safetyMetrics.safetyObservations}</span>
              <span className="trend positive" aria-label="Increase of 12">
                +12
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-row">
        {/* Incident Trends Card */}
        <section
          aria-labelledby="incident-trends-heading"
          className={`dashboard-card ${
            expandedChart === "incidents" ? "expanded" : ""
          }`}
        >
          <div className="card-header">
            <h3 id="incident-trends-heading" className="card-title">
              Incident Trends
            </h3>
            <div className="card-actions">
              {/* Incident Export Dropdown */}
              <div className="dropdown" ref={incidentExportRef}>
                <button
                  ref={incidentExportButtonRef}
                  className="dropdown-toggle card-action-button"
                  onClick={() => setIncidentExportOpen(!incidentExportOpen)}
                  aria-haspopup="true"
                  aria-expanded={incidentExportOpen}
                  aria-controls="incident-export-menu"
                  aria-label="Export Incident Trends Chart"
                >
                  {/* SVG */}
                  Export
                </button>
                {incidentExportOpen && (
                  <div
                    id="incident-export-menu"
                    className="dropdown-menu"
                    role="menu"
                    aria-labelledby={incidentExportButtonRef.current?.id}
                    onKeyDown={(e) => handleDropdownKeyDown(e, "incidents")}
                  >
                    <button
                      role="menuitem"
                      onClick={() => exportChart("incidents", "png")}
                    >
                      PNG Image
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => exportChart("incidents", "pdf")}
                    >
                      PDF Document
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => exportChart("incidents", "csv")}
                    >
                      CSV Data
                    </button>
                  </div>
                )}
              </div>
              {/* Expand/Collapse Button */}
              <button
                className="card-action-button"
                onClick={() => toggleChartExpansion("incidents")}
                aria-expanded={expandedChart === "incidents"}
                aria-controls="incident-chart-content"
                aria-label={
                  expandedChart === "incidents"
                    ? "Minimize Incident Trends Chart"
                    : "Expand Incident Trends Chart"
                }
              >
                {/* SVG */}
              </button>
            </div>
          </div>
          <div id="incident-chart-content" className="card-content">
            <div
              className="chart-container"
              aria-label="Incident Trends Bar Chart"
            >
              {/* Placeholder Chart - Replace with actual charting library component */}
              <div
                className="placeholder-chart"
                role="img"
                aria-label="Bar chart showing incident trends over the last 5 months."
              >
                {/* ... placeholder bars ... */}
              </div>
              {/* Actual Chart Component would go here */}
              {/* <ResponsiveContainer width="100%" height={300}> <BarChart data={incidentData}> ... </BarChart> </ResponsiveContainer> */}

              {expandedChart === "incidents" && (
                <div className="expanded-chart-details">
                  <h4>Incident Details Table</h4>
                  {/* ... table ... */}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Compliance Metrics Card */}
        <section
          aria-labelledby="compliance-metrics-heading"
          className={`dashboard-card ${
            expandedChart === "compliance" ? "expanded" : ""
          }`}
        >
          <div className="card-header">
            <h3 id="compliance-metrics-heading" className="card-title">
              Compliance Metrics
            </h3>
            <div className="card-actions">
              {/* Compliance Export Dropdown */}
              <div className="dropdown" ref={complianceExportRef}>
                <button
                  ref={complianceExportButtonRef}
                  className="dropdown-toggle card-action-button"
                  onClick={() => setComplianceExportOpen(!complianceExportOpen)}
                  aria-haspopup="true"
                  aria-expanded={complianceExportOpen}
                  aria-controls="compliance-export-menu"
                  aria-label="Export Compliance Metrics Chart"
                >
                  {/* SVG */}
                  Export
                </button>
                {complianceExportOpen && (
                  <div
                    id="compliance-export-menu"
                    className="dropdown-menu"
                    role="menu"
                    aria-labelledby={complianceExportButtonRef.current?.id}
                    onKeyDown={(e) => handleDropdownKeyDown(e, "compliance")}
                  >
                    <button
                      role="menuitem"
                      onClick={() => exportChart("compliance", "png")}
                    >
                      PNG Image
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => exportChart("compliance", "pdf")}
                    >
                      PDF Document
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => exportChart("compliance", "csv")}
                    >
                      CSV Data
                    </button>
                  </div>
                )}
              </div>
              {/* Expand/Collapse Button */}
              <button
                className="card-action-button"
                onClick={() => toggleChartExpansion("compliance")}
                aria-expanded={expandedChart === "compliance"}
                aria-controls="compliance-chart-content"
                aria-label={
                  expandedChart === "compliance"
                    ? "Minimize Compliance Metrics Chart"
                    : "Expand Compliance Metrics Chart"
                }
              >
                {/* SVG */}
              </button>
            </div>
          </div>
          <div id="compliance-chart-content" className="card-content">
            <div
              className="chart-container"
              aria-label="Compliance Metrics Donut Chart"
            >
              {/* Placeholder Chart - Replace with actual charting library component */}
              <div
                className="placeholder-chart"
                role="img"
                aria-label="Donut chart showing 96% compliance."
              >
                {/* ... placeholder donut ... */}
              </div>
              {/* Actual Chart Component would go here */}
              {/* <ResponsiveContainer width="100%" height={300}> <PieChart> ... </PieChart> </ResponsiveContainer> */}

              {expandedChart === "compliance" && (
                <div className="expanded-chart-details">
                  <h4>Compliance Details Table</h4>
                  {/* ... table ... */}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Upcoming Meetings Section */}
      <section
        aria-labelledby="upcoming-meetings-heading"
        className="dashboard-card"
      >
        <div className="card-header">
          <h3 id="upcoming-meetings-heading" className="card-title">
            Upcoming Meetings & Drills
          </h3>
          {/* Add actions if needed, e.g., link to calendar */}
        </div>
        <div className="card-content">
          <ul className="meeting-list">
            {upcomingMeetings.map((meeting) => (
              <li key={meeting.id} className="meeting-item">
                <div className="meeting-icon" aria-hidden="true">
                  {/* SVG */}
                </div>
                <div className="meeting-details">
                  <span className="meeting-title">{meeting.title}</span>
                  <span className="meeting-meta">
                    {meeting.date} | {meeting.location} | {meeting.attendees}{" "}
                    Attendees
                  </span>
                </div>
                <button
                  className="meeting-action"
                  aria-label={`View details for ${meeting.title}`}
                >
                  {/* SVG */}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Add specific styles */}
      <style>{`
        /* Enhanced Dashboard Styles */
        .enhanced-dashboard .dashboard-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .enhanced-dashboard .metric-card {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all var(--transition-normal);
        }
        .enhanced-dashboard .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .enhanced-dashboard .metric-icon {
          flex-shrink: 0;
          padding: 0.8rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-light);
        }
        .enhanced-dashboard .metric-icon svg {
          width: 24px;
          height: 24px;
          color: var(--primary-color);
        }
        .enhanced-dashboard .metric-content h3 {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-light);
          margin-bottom: 0.25rem;
        }
        .enhanced-dashboard .metric-value {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .enhanced-dashboard .metric-value .value {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-color);
        }
        .enhanced-dashboard .metric-value .trend {
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-sm);
        }
        .enhanced-dashboard .metric-value .trend.positive { color: var(--success-color); background-color: var(--success-light); }
        .enhanced-dashboard .metric-value .trend.negative { color: var(--danger-color); background-color: var(--danger-light); }

        .enhanced-dashboard .dashboard-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .enhanced-dashboard .dashboard-card {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden; /* Contain children */
          transition: height 0.3s ease;
        }
        .enhanced-dashboard .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .enhanced-dashboard .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
        .enhanced-dashboard .card-actions {
          display: flex;
          gap: 0.5rem;
        }
        .enhanced-dashboard .card-action-button {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast);
        }
        .enhanced-dashboard .card-action-button:hover {
          background-color: var(--bg-light);
        }
        .enhanced-dashboard .card-content {
          padding: 1.5rem;
        }
        .enhanced-dashboard .chart-container {
          height: 300px;
          position: relative;
        }
        .enhanced-dashboard .placeholder-chart {
          background-color: var(--bg-light);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-lighter);
          font-style: italic;
          border-radius: var(--radius-sm);
        }
        .enhanced-dashboard .expanded-chart-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed var(--border-light);
        }

        .enhanced-dashboard .meeting-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .enhanced-dashboard .meeting-item {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-light);
        }
        .enhanced-dashboard .meeting-item:last-child {
          border-bottom: none;
        }
        .enhanced-dashboard .meeting-icon {
          margin-right: 1rem;
          color: var(--primary-color);
        }
        .enhanced-dashboard .meeting-details {
          flex-grow: 1;
        }
        .enhanced-dashboard .meeting-title {
          display: block;
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        .enhanced-dashboard .meeting-meta {
          font-size: 0.85rem;
          color: var(--text-light);
        }
        .enhanced-dashboard .meeting-action {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Dropdown Styles */
        .dropdown {
          position: relative;
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 5px);
          right: 0;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown);
          min-width: 160px;
          padding: 0.5rem 0;
          animation: fadeInScale 0.15s ease-out;
          transform-origin: top right;
        }
        .dropdown-menu button {
          display: block;
          width: 100%;
          padding: 0.6rem 1rem;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color var(--transition-fast);
        }
        .dropdown-menu button:hover, .dropdown-menu button:focus {
          background-color: var(--bg-light);
          outline: none;
        }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;
