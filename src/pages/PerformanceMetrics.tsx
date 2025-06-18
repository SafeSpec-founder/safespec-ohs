import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db } from "../utils/firebase"; // Assuming db is exported from firebase.ts
import {
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where,
} from "firebase/firestore";

Chart.register(...registerables);

// --- Interfaces ---
interface MetricValue {
  value: number;
  trend: number; // Trend might need to be calculated based on historical data
  previousValue?: number; // Will be fetched or calculated
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

// Interface for historical data points from Firestore
interface MetricHistoryPoint {
  id?: string; // Firestore doc ID
  timestamp: Timestamp;
  metricKey: MetricKey;
  value: number;
}

// Interface for the detailed data used by the chart
interface DetailedDataPoint {
  month: string; // Or date string
  value: number;
}

type MetricKey = keyof Metrics;

// --- Helper Functions (Keep existing helpers: getMetricName, getMetricSource, etc.) ---
const getMetricName = (key: MetricKey): string => {
  const names: Record<MetricKey, string> = {
    incidentRate: "Incident Rate",
    safetyScore: "Safety Score",
    equipmentCompliance: "Equipment Compliance",
    trainingCompletion: "Training Completion",
    hseTargetProgress: "HSE Target Progress",
    nearMisses: "Near Misses",
    safetyObservations: "Safety Observations",
  };
  return names[key] || "Metric";
};

const getMetricSource = (key: MetricKey): string => {
  const sources: Record<MetricKey, string> = {
    incidentRate: "Incident Reports",
    safetyScore: "Safety Audits",
    equipmentCompliance: "Equipment Inspections",
    trainingCompletion: "Training Records",
    hseTargetProgress: "Project Goals",
    nearMisses: "Incident Reports",
    safetyObservations: "Safety Observations",
  };
  return sources[key] || "N/A";
};

const getMetricStatus = (
  key: MetricKey,
  value: number,
): { text: string; className: string } => {
  const thresholds: Record<string, { good: number; warning: number }> = {
    incidentRate: { good: 1.0, warning: 2.0 },
    safetyScore: { good: 90, warning: 80 },
    equipmentCompliance: { good: 95, warning: 90 },
    trainingCompletion: { good: 90, warning: 80 },
    hseTargetProgress: { good: 80, warning: 60 },
    nearMisses: { good: 5, warning: 10 },
    safetyObservations: { good: 30, warning: 15 },
  };
  const metricThresholds = thresholds[key];
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
  trend: number | undefined,
): { text: string; className: string; ariaLabel: string } => {
  if (trend === undefined)
    return {
      text: "N/A",
      className: "trend neutral",
      ariaLabel: "Trend: Not available",
    };
  const isLowerBetter = key === "incidentRate" || key === "nearMisses";
  const isPositive = isLowerBetter ? trend < 0 : trend > 0;
  const isNegative = isLowerBetter ? trend > 0 : trend < 0;
  const unit =
    key !== "incidentRate" &&
    key !== "nearMisses" &&
    key !== "safetyObservations"
      ? "%"
      : "";
  const trendText = `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}${unit}`;
  let className = "trend";
  let trendDescription = "no change";
  if (isPositive) {
    className += " positive";
    trendDescription = `improvement of ${Math.abs(trend).toFixed(1)}${unit}`;
  }
  if (isNegative) {
    className += " negative";
    trendDescription = `decline of ${Math.abs(trend).toFixed(1)}${unit}`;
  }
  if (trend === 0) className += " neutral";

  return {
    text: trendText,
    className,
    ariaLabel: `Trend: ${trendDescription}`,
  };
};

const formatMetricValue = (key: MetricKey, value: number): string => {
  if (
    key === "incidentRate" ||
    key === "nearMisses" ||
    key === "safetyObservations"
  ) {
    return value.toString();
  }
  return `${value.toFixed(1)}%`; // Format percentage with one decimal
};

// --- Performance Metrics Component ---
const PerformanceMetrics: React.FC = () => {
  const { addToast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("7d"); // Default time range
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const [detailedChartData, setDetailedChartData] = useState<
    DetailedDataPoint[]
  >([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(
    null,
  );
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any | null>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch latest metrics and calculate trends
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Fetch latest metric snapshot (assuming a 'latestMetrics' doc)
        const latestMetricsDocRef = doc(db, "performanceOverview", "latest");
        const latestMetricsSnap = await getDoc(latestMetricsDocRef);

        if (!latestMetricsSnap.exists()) {
          throw new Error("Latest metrics data not found.");
        }
        const latestData = latestMetricsSnap.data();

        // Fetch previous metric snapshot for trend calculation
        // (Assuming history is stored in 'metricsHistory' ordered by timestamp)
        const historyCollectionRef = collection(db, "metricsHistory");
        const prevMetricsQuery = query(
          historyCollectionRef,
          orderBy("timestamp", "desc"),
          limit(2),
        );
        const prevMetricsSnap = await getDocs(prevMetricsQuery);

        let previousData: Record<string, number> = {};
        if (prevMetricsSnap.docs.length > 1) {
          // Use the second most recent document as the previous data point
          previousData = prevMetricsSnap.docs[1].data() as Record<
            string,
            number
          >;
        }

        // Construct the Metrics object
        const fetchedMetrics: Partial<Metrics> = {};
        for (const key in latestData) {
          if (Object.prototype.hasOwnProperty.call(latestData, key)) {
            const metricKey = key as MetricKey;
            const currentValue = latestData[metricKey];
            const prevValue = previousData[metricKey];
            let trend = 0;
            if (prevValue !== undefined && prevValue !== 0) {
              trend = currentValue - prevValue;
              // Optional: Calculate percentage trend if needed
              // trend = ((currentValue - prevValue) / prevValue) * 100;
            }

            fetchedMetrics[metricKey] = {
              value: currentValue,
              trend: trend,
              previousValue: prevValue,
            };
          }
        }

        setMetrics(fetchedMetrics as Metrics);
      } catch (error) {
        console.error("Error fetching performance metrics: ", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Could not load performance metrics.",
        });
        setMetrics(null); // Clear metrics on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [addToast]); // Fetch only once on mount, or refetch based on timeRange if needed

  // Fetch detailed historical data for the selected metric chart
  useEffect(() => {
    if (!showDetailedView || !selectedMetric) {
      setDetailedChartData([]); // Clear data when modal is closed or no metric selected
      return;
    }

    const fetchDetailedData = async () => {
      try {
        const historyCollectionRef = collection(db, "metricsHistory");
        // Query for the specific metric, order by time, limit results (e.g., last 12 months)
        const q = query(
          historyCollectionRef,
          where("metricKey", "==", selectedMetric),
          orderBy("timestamp", "desc"),
          limit(12), // Fetch last 12 data points for the chart
        );
        const querySnapshot = await getDocs(q);
        const fetchedData: DetailedDataPoint[] = [];
        querySnapshot.docs.reverse().forEach((doc) => {
          // Reverse to show oldest first
          const data = doc.data() as MetricHistoryPoint;
          fetchedData.push({
            // Format timestamp to month/year or desired label
            month: data.timestamp
              .toDate()
              .toLocaleString("default", { month: "short", year: "numeric" }),
            value: data.value,
          });
        });
        setDetailedChartData(fetchedData);
      } catch (error) {
        console.error(
          `Error fetching detailed data for ${selectedMetric}: `,
          error,
        );
        addToast({
          type: "error",
          title: "Error",
          message: `Could not load detailed data for ${getMetricName(
            selectedMetric,
          )}.`,
        });
        setDetailedChartData([]);
      }
    };

    fetchDetailedData();
  }, [showDetailedView, selectedMetric, addToast]);

  // Chart rendering logic (using detailedChartData state)
  useEffect(() => {
    let chart: any | null = null;
    if (
      showDetailedView &&
      selectedMetric &&
      chartRef.current &&
      detailedChartData.length > 0
    ) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const chartConfig: any = {
          type: "line",
          data: {
            labels: detailedChartData.map((d) => d.month),
            datasets: [
              {
                label: getMetricName(selectedMetric),
                data: detailedChartData.map((d) => d.value),
                borderColor: "var(--primary-color)",
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                tension: 0.1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "var(--text-color)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
              },
            },
            scales: {
              y: {
                beginAtZero: selectedMetric !== "incidentRate",
                grid: { color: "var(--border-light)" },
                ticks: { color: "var(--text-light)" },
              },
              x: {
                grid: { display: false },
                ticks: { color: "var(--text-light)" },
              },
            },
          },
        };
        chart = new Chart(ctx, chartConfig);
        chartInstanceRef.current = chart;
      }
    }
    return () => {
      if (chart) {
        chart.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [showDetailedView, selectedMetric, detailedChartData]); // Depend on fetched data

  // --- Event Handlers (Keep existing: handleTimeRangeChange, showMetricDetails, etc.) ---
  const handleTimeRangeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setTimeRange(e.target.value);
    // Optional: Trigger refetch of metrics if timeRange affects the main view
    // fetchMetrics(); // Be careful with dependencies if uncommenting
  };

  const showMetricDetails = (metricKey: MetricKey): void => {
    setSelectedMetric(metricKey);
    setShowDetailedView(true);
  };

  const closeDetailedView = useCallback(() => {
    setShowDetailedView(false);
    setTimeout(() => setSelectedMetric(null), 300);
  }, []);

  const toggleExportOptions = (): void => {
    setShowExportOptions((prev) => !prev);
  };

  const exportMetricsData = async (format: "pdf" | "excel"): Promise<void> => {
    if (isExporting) return;
    setIsExporting(true);
    setExportFormat(format);
    setShowExportOptions(false);
    addToast({
      type: "info",
      title: "Exporting Data",
      message: `Preparing ${format.toUpperCase()} export...`,
    });

    try {
      const container = document.querySelector(
        ".performance-metrics-container",
      ) as HTMLElement | null;
      if (!container) throw new Error("Metrics container not found");

      if (format === "pdf") {
        const canvas = await html2canvas(container);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = (canvas.height * pageWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save("performance-metrics.pdf");
      } else {
        const rows = Object.entries(metrics || {}).map(
          ([key, val]) => `${key},${val.value}`,
        );
        const csv = ["Metric,Value", ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "performance-metrics.csv";
        link.click();
        URL.revokeObjectURL(link.href);
      }

      addToast({
        type: "success",
        title: "Export Ready",
        message: `Metrics data export (${format.toUpperCase()}) is ready.`,
      });
    } catch (error) {
      console.error("Metrics export failed", error);
      addToast({
        type: "error",
        title: "Export Failed",
        message: "Could not export metrics data.",
      });
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // --- Focus Management & Keyboard Nav (Keep existing hooks) ---
  // Focus management for modal
  useEffect(() => {
    let modalElement: HTMLDivElement | null = null;
    let escapeKeyListener: ((event: KeyboardEvent) => void) | null = null;
    let tabKeyListener: ((event: KeyboardEvent) => void) | null = null;

    if (showDetailedView && modalRef.current) {
      modalElement = modalRef.current; // Store ref value locally
      modalCloseButtonRef.current?.focus(); // Focus close button on open
      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      tabKeyListener = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      };

      escapeKeyListener = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closeDetailedView();
        }
      };

      modalElement.addEventListener("keydown", tabKeyListener);
      document.addEventListener("keydown", escapeKeyListener);
    }

    // Cleanup function: Always return this function - TS7030 Fix
    return () => {
      if (modalElement && tabKeyListener) {
        modalElement.removeEventListener("keydown", tabKeyListener);
      }
      if (escapeKeyListener) {
        document.removeEventListener("keydown", escapeKeyListener);
      }
    };
  }, [showDetailedView, closeDetailedView]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node) &&
        exportButtonRef.current &&
        !exportButtonRef.current.contains(event.target as Node)
      ) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Render Helpers ---
  const renderMetricCard = (
    metricKey: MetricKey,
    icon: React.ReactNode,
  ): React.ReactNode => {
    if (!metrics) return null;
    const metricData = metrics[metricKey];
    if (!metricData) return null;
    const status = getMetricStatus(metricKey, metricData.value);
    const trend = formatTrend(metricKey, metricData.trend);
    return (
      <div
        className="metric-card"
        onClick={() => showMetricDetails(metricKey)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${getMetricName(metricKey)}`}
      >
        <div className="metric-header">
          <div className="metric-icon">{icon}</div>
          <div className="metric-title">{getMetricName(metricKey)}</div>
        </div>
        <div className="metric-value">
          {formatMetricValue(metricKey, metricData.value)}
        </div>
        <div className="metric-footer">
          <div className={`metric-status ${status.className}`}>
            {status.text}
          </div>
          <div className={trend.className} aria-label={trend.ariaLabel}>
            {trend.text}
          </div>
        </div>
        <div className="metric-source">
          Source: {getMetricSource(metricKey)}
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="performance-metrics-container">
      <div className="metrics-header">
        <h1>Performance Metrics</h1>
        <div className="metrics-controls">
          <div className="time-range-selector">
            <label htmlFor="time-range">Time Range:</label>
            <select
              id="time-range"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div className="export-container">
            <button
              ref={exportButtonRef}
              type="button"
              className={`export-button ${isExporting ? "loading" : ""}`}
              onClick={toggleExportOptions}
              disabled={isExporting || !metrics}
              aria-haspopup="true"
              aria-expanded={!!showExportOptions} // Ensure the value is explicitly a boolean
            >
              {isExporting
                ? `Exporting ${exportFormat?.toUpperCase()}...`
                : "Export"}
            </button>
            {showExportOptions && (
              <div ref={exportMenuRef} className="export-options">
                <button onClick={() => exportMetricsData("pdf")}>PDF</button>
                <button onClick={() => exportMetricsData("excel")}>
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">Loading metrics data...</div>
      ) : !metrics ? (
        <div className="error-container">
          Could not load metrics data. Please try again later.
        </div>
      ) : (
        <div className="metrics-grid">
          {renderMetricCard("incidentRate", <span>📊</span>)}
          {renderMetricCard("safetyScore", <span>🔍</span>)}
          {renderMetricCard("equipmentCompliance", <span>🔧</span>)}
          {renderMetricCard("trainingCompletion", <span>📚</span>)}
          {metrics.hseTargetProgress &&
            renderMetricCard("hseTargetProgress", <span>🎯</span>)}
          {metrics.nearMisses &&
            renderMetricCard("nearMisses", <span>⚠️</span>)}
          {metrics.safetyObservations &&
            renderMetricCard("safetyObservations", <span>👁️</span>)}
          {/* Add more cards as needed */}
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetailedView && selectedMetric && (
        <div className="modal-overlay" onClick={closeDetailedView}>
          {" "}
          {/* Close on overlay click */}
          <div
            ref={modalRef}
            className="modal-container detailed-metric-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <h2 id="modal-title">
                Detailed View: {getMetricName(selectedMetric)}
              </h2>
              <button
                ref={modalCloseButtonRef}
                type="button"
                className="close-button"
                onClick={closeDetailedView}
                aria-label="Close detailed view"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="metric-details">
                <div className="metric-info">
                  <p>
                    <strong>Source:</strong> {getMetricSource(selectedMetric)}
                  </p>
                  <p>
                    <strong>Current Value:</strong>{" "}
                    {metrics && metrics[selectedMetric]
                      ? formatMetricValue(
                          selectedMetric,
                          metrics[selectedMetric].value,
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {metrics && metrics[selectedMetric]
                      ? getMetricStatus(
                          selectedMetric,
                          metrics[selectedMetric].value,
                        ).text
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Trend:</strong>{" "}
                    {metrics && metrics[selectedMetric]
                      ? formatTrend(
                          selectedMetric,
                          metrics[selectedMetric].trend,
                        ).text
                      : "N/A"}
                  </p>
                </div>
                <div className="chart-container">
                  <h3>Historical Trend</h3>
                  {detailedChartData.length > 0 ? (
                    <canvas ref={chartRef} height="300"></canvas>
                  ) : (
                    <div className="no-data-message">
                      No historical data available for this metric.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeDetailedView}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => exportMetricsData("pdf")}
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
