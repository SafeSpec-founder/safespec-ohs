import React, { useState, useEffect } from "react";
// import { useAuth } from '../contexts/AuthContext'; // Removed unused import (TS6133 Fix)
// import { useToast } from '../contexts/ToastContext'; // Removed unused import (TS6133 Fix)

// --- Interfaces (Copied/Adapted from PerformanceMetrics & PermitManager) ---
interface MetricValue {
  value: number;
  trend: number;
  previousValue?: number;
}

interface Metrics {
  incidentRate: MetricValue;
  safetyScore: MetricValue;
  equipmentCompliance: MetricValue;
  trainingCompletion: MetricValue;
  hseTargetProgress?: MetricValue;
  nearMisses?: MetricValue;
  safetyObservations?: MetricValue;
}

type MetricKey = keyof Metrics;

interface PermitStats {
  active: number;
  pending: number;
  expired: number;
  closed: number;
  revoked: number;
}

// --- Helper Functions (Copied/Adapted from PerformanceMetrics) ---
const getMetricName = (key: MetricKey): string => {
  switch (key) {
    case "incidentRate":
      return "Incident Rate";
    case "safetyScore":
      return "Safety Score";
    case "equipmentCompliance":
      return "Equipment Compliance";
    case "trainingCompletion":
      return "Training Completion";
    case "hseTargetProgress":
      return "HSE Target Progress";
    case "nearMisses":
      return "Near Misses";
    case "safetyObservations":
      return "Safety Observations";
    default:
      return "Metric";
  }
};

const getMetricSource = (key: MetricKey): string => {
  switch (key) {
    case "incidentRate":
      return "Incident Reports";
    case "safetyScore":
      return "Safety Audits";
    case "equipmentCompliance":
      return "Equipment Inspections";
    case "trainingCompletion":
      return "Training Records";
    case "hseTargetProgress":
      return "Project Goals";
    case "nearMisses":
      return "Incident Reports";
    case "safetyObservations":
      return "Safety Observations";
    default:
      return "N/A";
  }
};

const getMetricStatus = (
  key: MetricKey,
  value: number,
): { text: string; className: string } => {
  const thresholds = {
    incidentRate: { good: 1.0, warning: 2.0 }, // Lower is better
    safetyScore: { good: 90, warning: 80 }, // Higher is better
    equipmentCompliance: { good: 95, warning: 90 }, // Higher is better
    trainingCompletion: { good: 90, warning: 80 }, // Higher is better
    hseTargetProgress: { good: 80, warning: 60 }, // Higher is better
    nearMisses: { good: 5, warning: 10 }, // Lower is better
    safetyObservations: { good: 30, warning: 15 }, // Higher is better
  };
  const metricThresholds = thresholds[key as keyof typeof thresholds];
  if (!metricThresholds) return { text: "N/A", className: "badge-secondary" };
  const isLowerBetter = key === "incidentRate" || key === "nearMisses";
  if (isLowerBetter) {
    if (value <= metricThresholds.good)
      return { text: "Good", className: "badge-success" };
    if (value <= metricThresholds.warning)
      return { text: "Needs Attention", className: "badge-warning" };
    return { text: "Poor", className: "badge-error" };
  } else {
    if (value >= metricThresholds.good)
      return { text: "Good", className: "badge-success" };
    if (value >= metricThresholds.warning)
      return { text: "Needs Attention", className: "badge-warning" };
    return { text: "Poor", className: "badge-error" };
  }
};

const formatTrend = (
  key: MetricKey,
  trend: number,
): { text: string; className: string } => {
  const isLowerBetter = key === "incidentRate" || key === "nearMisses";
  const isPositive = isLowerBetter ? trend < 0 : trend > 0;
  const isNegative = isLowerBetter ? trend > 0 : trend < 0;
  const trendText = `${trend >= 0 ? "+" : ""}${trend}${key !== "incidentRate" && key !== "nearMisses" && key !== "safetyObservations" ? "%" : ""}`;
  let className = "trend";
  if (isPositive) className += " positive";
  if (isNegative) className += " negative";
  if (trend === 0) className += " neutral";
  return { text: trendText, className };
};

const formatMetricValue = (key: MetricKey, value: number): string => {
  if (
    key === "incidentRate" ||
    key === "nearMisses" ||
    key === "safetyObservations"
  ) {
    return value.toString();
  }
  return `${value}%`;
};

// --- Admin Dashboard Component ---
const AdminDashboard: React.FC = () => {
  // const { userRole } = useAuth(); // Removed unused variable (TS6133 Fix)
  // const { addToast } = useToast(); // Removed unused variable (TS6133 Fix)
  const [timeRange, setTimeRange] = useState<string>("30d"); // Default to 30 days
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isLoadingPermits, setIsLoadingPermits] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [permitStats, setPermitStats] = useState<PermitStats | null>(null);

  // Simulate fetching Performance Metrics data
  useEffect(() => {
    setIsLoadingMetrics(true);
    console.log(
      `AdminDashboard: Fetching metrics for time range: ${timeRange}`,
    );
    setTimeout(() => {
      const fetchedMetrics: Metrics = {
        incidentRate: { value: 1.2, trend: -0.3, previousValue: 1.5 },
        safetyScore: { value: 92, trend: 2, previousValue: 90 },
        equipmentCompliance: { value: 98, trend: 1, previousValue: 97 },
        trainingCompletion: { value: 95, trend: 3, previousValue: 92 },
        hseTargetProgress: { value: 75, trend: 5, previousValue: 70 },
        nearMisses: { value: 8, trend: 2, previousValue: 6 },
        safetyObservations: { value: 42, trend: 12, previousValue: 30 },
      };
      setMetrics(fetchedMetrics);
      setIsLoadingMetrics(false);
    }, 800); // Simulate network delay
  }, [timeRange]);

  // Simulate fetching Permit Statistics data
  useEffect(() => {
    setIsLoadingPermits(true);
    console.log(`AdminDashboard: Fetching permit stats`);
    setTimeout(() => {
      const fetchedPermitStats: PermitStats = {
        active: 15,
        pending: 5,
        expired: 3,
        closed: 25,
        revoked: 1,
      };
      setPermitStats(fetchedPermitStats);
      setIsLoadingPermits(false);
    }, 600); // Simulate different network delay
  }, []); // Fetch only once on mount for this example

  const handleTimeRangeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setTimeRange(e.target.value);
  };

  // Helper to get human-readable time range label
  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "1y":
        return "Last Year";
      default:
        return range;
    }
  };

  // Get stats icon class (Simplified from PermitManager)
  const getStatsIconClass = (type: keyof PermitStats): string => {
    switch (type) {
      case "active":
        return "active";
      case "pending":
        return "pending";
      case "expired":
        return "expired";
      case "closed":
        return "closed";
      case "revoked":
        return "revoked";
      default:
        return "default";
    }
  };

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="dashboard-actions">
          <select
            className="filter-select"
            value={timeRange}
            onChange={handleTimeRangeChange}
            disabled={isLoadingMetrics}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          {/* Add other global actions if needed */}
        </div>
      </div>

      {/* --- Permit Statistics Section --- */}
      <div className="dashboard-section">
        <h2 className="section-title">Permit Overview</h2>
        {isLoadingPermits ? (
          <div className="loader-container small">
            <div className="loader"></div>
          </div>
        ) : permitStats ? (
          <div className="permit-stats-grid">
            {(Object.keys(permitStats) as Array<keyof PermitStats>).map(
              (key) => (
                <div
                  key={key}
                  className={`stats-card ${getStatsIconClass(key)}`}
                >
                  <div className="stats-value">{permitStats[key]}</div>
                  <div className="stats-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Permits
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p>Could not load permit statistics.</p>
        )}
      </div>

      {/* --- Performance Metrics Breakdown Table Section --- */}
      <div className="dashboard-section">
        <h2 className="section-title">
          Performance Metrics Breakdown ({getTimeRangeLabel(timeRange)})
        </h2>
        <div className="dashboard-card">
          <div className="card-content no-padding">
            {isLoadingMetrics ? (
              <div className="loader-container">
                <div className="loader"></div>
                <div className="loader-text">Loading metrics...</div>
              </div>
            ) : metrics ? (
              <div className="metrics-table-container">
                <table className="data-table full-width">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Current Value</th>
                      <th>Change</th>
                      <th>Previous Value</th>
                      <th>Status</th>
                      <th>Data Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(metrics) as MetricKey[]).map((key) => {
                      const metric = metrics[key];
                      if (!metric) return null;
                      const trendInfo = formatTrend(key, metric.trend);
                      const status = getMetricStatus(key, metric.value);
                      return (
                        <tr key={key}>
                          <td>{getMetricName(key)}</td>
                          <td>{formatMetricValue(key, metric.value)}</td>
                          <td>
                            <span className={trendInfo.className}>
                              {trendInfo.text}
                            </span>
                          </td>
                          <td>
                            {metric.previousValue !== undefined
                              ? formatMetricValue(key, metric.previousValue)
                              : "N/A"}
                          </td>
                          <td>
                            <span className={`badge ${status.className}`}>
                              {status.text}
                            </span>
                          </td>
                          <td>{getMetricSource(key)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state-row">
                Could not load performance metrics.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Other Admin Dashboard Sections (Placeholders/Existing) --- */}
      {/* Example: Add sections for User Management, System Logs, etc. */}
      {/* <div className="dashboard-section">
        <h2 className="section-title">User Management Overview</h2>
        </div> */}

      <style>{`
        .admin-dashboard .dashboard-section {
          margin-bottom: 2rem;
        }
        .admin-dashboard .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        
        /* Permit Stats Grid */
        .admin-dashboard .permit-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        .admin-dashboard .stats-card {
          background-color: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 1.25rem;
          text-align: center;
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--color-default);
        }
        .admin-dashboard .stats-card.active { border-left-color: var(--success-color); }
        .admin-dashboard .stats-card.pending { border-left-color: var(--warning-color); }
        .admin-dashboard .stats-card.expired { border-left-color: var(--error-color); }
        .admin-dashboard .stats-card.closed { border-left-color: var(--info-color); }
        .admin-dashboard .stats-card.revoked { border-left-color: var(--error-dark); }
        
        .admin-dashboard .stats-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .admin-dashboard .stats-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Metrics Table */
        .admin-dashboard .metrics-table-container {
          overflow-x: auto; /* Allow horizontal scroll on small screens */
        }
        .admin-dashboard .data-table.full-width {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-dashboard .data-table th,
        .admin-dashboard .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .admin-dashboard .data-table th {
          background-color: var(--background-alt);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .admin-dashboard .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .admin-dashboard .data-table .trend {
          font-weight: 500;
        }
        .admin-dashboard .data-table .trend.positive { color: var(--success-dark); }
        .admin-dashboard .data-table .trend.negative { color: var(--error-dark); }
        .admin-dashboard .data-table .trend.neutral { color: var(--text-tertiary); }
        
        .admin-dashboard .data-table .badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .admin-dashboard .data-table .badge-success { background-color: var(--success-light); color: var(--success-dark); }
        .admin-dashboard .data-table .badge-warning { background-color: var(--warning-light); color: var(--warning-dark); }
        .admin-dashboard .data-table .badge-error { background-color: var(--error-light); color: var(--error-dark); }
        .admin-dashboard .data-table .badge-info { background-color: var(--info-light); color: var(--info-dark); }
        .admin-dashboard .data-table .badge-secondary { background-color: var(--grey-light); color: var(--grey-dark); }

        .admin-dashboard .loader-container.small {
          min-height: 100px; /* Adjust height for smaller loaders */
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-dashboard .empty-state-row {
            text-align: center;
            padding: 1.5rem;
            color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
