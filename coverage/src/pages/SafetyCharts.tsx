import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from '../contexts/AuthContext'; // Removed unused import (TS6133 Fix)
import { useToast } from "../contexts/ToastContext";
import {
  Chart as Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  registerables,
} from "chart.js";
import jsPDF from "jspdf";

// Register all the Chart.js components we need
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ...registerables,
);

interface ChartData {
  labels: string[];
  data: number[];
}

const SafetyCharts: React.FC = () => {
  // const { } = useAuth(); // Removed unused import
  const { addToast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("6m");
  // const [chartType] = useState<string>('incidents'); // Removed unused variable (TS6133 Fix)
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [lastSuccessfulTimeRange, setLastSuccessfulTimeRange] = useState<
    string | null
  >(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const incidentChartRef = useRef<HTMLCanvasElement>(null);
  const complianceChartRef = useRef<HTMLCanvasElement>(null);
  const trainingChartRef = useRef<HTMLCanvasElement>(null);
  const riskDistributionRef = useRef<HTMLCanvasElement>(null);

  // Chart instances refs to properly clean up - using Chart for the correct type
  const incidentChartInstance = useRef<any | null>(null);
  const complianceChartInstance = useRef<any | null>(null);
  const trainingChartInstance = useRef<any | null>(null);
  const riskDistributionInstance = useRef<any | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    // Set mounted flag to true when component mounts
    isMountedRef.current = true;

    // Cleanup function to set mounted flag to false when component unmounts
    return () => {
      isMountedRef.current = false;

      // Clean up chart instances
      if (incidentChartInstance.current) {
        incidentChartInstance.current.destroy();
        incidentChartInstance.current = null;
      }
      if (complianceChartInstance.current) {
        complianceChartInstance.current.destroy();
        complianceChartInstance.current = null;
      }
      if (trainingChartInstance.current) {
        trainingChartInstance.current.destroy();
        trainingChartInstance.current = null;
      }
      if (riskDistributionInstance.current) {
        riskDistributionInstance.current.destroy();
        riskDistributionInstance.current = null;
      }
    };
  }, []);

  // Fetch data and initialize charts when component mounts or when chart type/time range changes
  useEffect(() => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;

    // Set loading state
    setLoading(true);

    // Simulate API fetch with timeout
    const fetchDataTimeout = setTimeout(() => {
      if (!isMountedRef.current) return;

      try {
        // Validate that we have data to render
        const incidentData = getIncidentData(timeRange);
        const complianceData = getComplianceData(timeRange);
        const trainingData = getTrainingData(timeRange);

        // Validate data before proceeding
        if (
          !validateChartData(incidentData) ||
          !validateChartData(complianceData) ||
          !validateChartData(trainingData)
        ) {
          throw new Error("Invalid or missing chart data");
        }

        // Render charts with validated data
        renderCharts();

        // Only show toast if time range changed and this is a successful data load
        if (timeRange !== lastSuccessfulTimeRange) {
          addToast({
            type: "success",
            title: "Charts Updated",
            message: `Safety data updated for ${getTimeRangeLabel(timeRange)}`,
          });

          // Update last successful time range
          setLastSuccessfulTimeRange(timeRange);
        }

        // Mark data as loaded
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading chart data:", error);

        // Only show error toast if we haven't already shown one for this time range
        if (timeRange !== lastSuccessfulTimeRange) {
          addToast({
            type: "error",
            title: "Data Error",
            message: "Failed to load safety data. Please try again.",
          });
        }
      } finally {
        // Always set loading to false when done
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }, 1000); // 1 second delay to simulate API call

    // Clean up timeout if component unmounts or dependencies change
    return () => {
      clearTimeout(fetchDataTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, addToast]); // Removed chartType if unused

  // Validate chart data to ensure it's not empty or invalid
  const validateChartData = (chartData: ChartData): boolean => {
    if (!chartData || !chartData.labels || !chartData.data) return false;
    if (chartData.labels.length === 0 || chartData.data.length === 0)
      return false;
    if (chartData.labels.length !== chartData.data.length) return false;

    // Check for invalid data values (null, undefined, NaN)
    for (const value of chartData.data) {
      if (value === null || value === undefined || isNaN(value)) return false;
    }

    return true;
  };

  const renderCharts = (): void => {
    renderIncidentChart();
    renderComplianceChart();
    renderTrainingChart();
    renderRiskDistributionChart();
  };

  const renderIncidentChart = (): void => {
    if (!incidentChartRef.current) return;

    const ctx = incidentChartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (incidentChartInstance.current) {
      incidentChartInstance.current.destroy();
      incidentChartInstance.current = null;
    }

    // Get data based on selected time range
    const { labels, data } = getIncidentData(timeRange);

    // Validate data before creating chart
    if (!validateChartData({ labels, data })) {
      console.error("Invalid incident data");
      return;
    }

    incidentChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Incidents",
            data,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Incident Trend (${getTimeRangeLabel(timeRange)})`,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                return `Incidents: ${context.raw || 0}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  };

  const renderComplianceChart = (): void => {
    if (!complianceChartRef.current) return;

    const ctx = complianceChartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (complianceChartInstance.current) {
      complianceChartInstance.current.destroy();
      complianceChartInstance.current = null;
    }

    // Get data based on selected time range
    const { labels, data } = getComplianceData(timeRange);

    // Validate data before creating chart
    if (!validateChartData({ labels, data })) {
      console.error("Invalid compliance data");
      return;
    }

    complianceChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Compliance Score",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Compliance Score Trend (${getTimeRangeLabel(timeRange)})`,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                return `Compliance: ${context.raw || 0}%`;
              },
            },
          },
        },
        scales: {
          y: {
            min: 70,
            max: 100,
            ticks: {
              callback: function (value: any) {
                return value + "%";
              },
            },
          },
        },
      },
    });
  };

  const renderTrainingChart = (): void => {
    if (!trainingChartRef.current) return;

    const ctx = trainingChartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (trainingChartInstance.current) {
      trainingChartInstance.current.destroy();
      trainingChartInstance.current = null;
    }

    // Get data based on selected time range
    const { labels, data } = getTrainingData(timeRange);

    // Validate data before creating chart
    if (!validateChartData({ labels, data })) {
      console.error("Invalid training data");
      return;
    }

    trainingChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Training Completion",
            data,
            backgroundColor: "#10b981",
            borderColor: "#059669",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Training Completion Rate (${getTimeRangeLabel(timeRange)})`,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                return `Completion: ${context.raw || 0}%`;
              },
            },
          },
        },
        scales: {
          y: {
            min: 70,
            max: 100,
            ticks: {
              callback: function (value: any) {
                return value + "%";
              },
            },
          },
        },
      },
    });
  };

  const renderRiskDistributionChart = (): void => {
    if (!riskDistributionRef.current) return;

    const ctx = riskDistributionRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (riskDistributionInstance.current) {
      riskDistributionInstance.current.destroy();
      riskDistributionInstance.current = null;
    }

    // Risk data is static and doesn't change with time range
    const riskData = [45, 30, 20, 5];

    // Validate data before creating chart
    if (
      !riskData ||
      riskData.length === 0 ||
      riskData.some(
        (item) => item === null || item === undefined || isNaN(item),
      )
    ) {
      console.error("Invalid risk distribution data");
      return;
    }

    riskDistributionInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Low", "Medium", "High", "Critical"],
        datasets: [
          {
            data: riskData,
            backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#7c3aed"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Risk Distribution by Severity",
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const total = riskData.reduce((sum, value) => sum + value, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  // Helper function to get time range label
  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case "1m":
        return "Last Month";
      case "3m":
        return "Last 3 Months";
      case "6m":
        return "Last 6 Months";
      case "1y":
        return "Last Year";
      default:
        return "Last 6 Months";
    }
  };

  // Mock data functions
  const getIncidentData = (range: string): ChartData => {
    let labels: string[] = [];
    let data: number[] = [];

    switch (range) {
      case "1m":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = [2, 1, 3, 0];
        break;
      case "3m":
        labels = ["Mar", "Apr", "May"];
        data = [5, 3, 1];
        break;
      case "6m":
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [4, 5, 3, 5, 3, 1];
        break;
      case "1y":
        labels = [
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
        ];
        data = [3, 2, 4, 5, 3, 2, 4, 5, 3, 5, 3, 1];
        break;
      default:
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [4, 5, 3, 5, 3, 1];
    }

    return { labels, data };
  };

  const getComplianceData = (range: string): ChartData => {
    let labels: string[] = [];
    let data: number[] = [];

    switch (range) {
      case "1m":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = [88, 90, 91, 92];
        break;
      case "3m":
        labels = ["Mar", "Apr", "May"];
        data = [85, 88, 92];
        break;
      case "6m":
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [82, 84, 83, 85, 88, 92];
        break;
      case "1y":
        labels = [
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
        ];
        data = [78, 80, 79, 81, 80, 82, 82, 84, 83, 85, 88, 92];
        break;
      default:
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [82, 84, 83, 85, 88, 92];
    }

    return { labels, data };
  };

  const getTrainingData = (range: string): ChartData => {
    let labels: string[] = [];
    let data: number[] = [];

    switch (range) {
      case "1m":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = [95, 96, 97, 98];
        break;
      case "3m":
        labels = ["Mar", "Apr", "May"];
        data = [92, 95, 98];
        break;
      case "6m":
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [88, 90, 91, 92, 95, 98];
        break;
      case "1y":
        labels = [
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
        ];
        data = [85, 86, 87, 88, 89, 87, 88, 90, 91, 92, 95, 98];
        break;
      default:
        labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        data = [88, 90, 91, 92, 95, 98];
    }

    return { labels, data };
  };

  // Handle download functionality for individual charts
  const handleDownload = (chartId: string): void => {
    let chartRef: React.RefObject<HTMLCanvasElement> | null = null;
    let fileName = "";

    switch (chartId) {
      case "incidents":
        chartRef = incidentChartRef;
        fileName = "incident_trend_chart.png";
        break;
      case "compliance":
        chartRef = complianceChartRef;
        fileName = "compliance_score_chart.png";
        break;
      case "training":
        chartRef = trainingChartRef;
        fileName = "training_completion_chart.png";
        break;
      case "risk":
        chartRef = riskDistributionRef;
        fileName = "risk_distribution_chart.png";
        break;
      default:
        addToast({
          type: "error",
          title: "Download Error",
          message: "Invalid chart selected for download.",
        });
        return;
    }

    if (chartRef && chartRef.current) {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = chartRef.current.toDataURL("image/png");
      link.click();
      addToast({
        type: "success",
        title: "Download Started",
        message: `Downloading ${fileName}...`,
      });
    } else {
      addToast({
        type: "error",
        title: "Download Error",
        message: "Chart canvas not found.",
      });
    }
  };

  // Handle Combined PDF Export
  const handleExportAll = async (): Promise<void> => {
    if (isExporting) return;
    setIsExporting(true);
    addToast({
      type: "info",
      title: "Exporting PDF",
      message: "Generating combined chart report...",
    });

    // Ensure all charts are rendered and refs are available
    if (
      !incidentChartRef.current ||
      !complianceChartRef.current ||
      !trainingChartRef.current ||
      !riskDistributionRef.current
    ) {
      addToast({
        type: "error",
        title: "Export Error",
        message: "One or more charts are not ready for export.",
      });
      setIsExporting(false);
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const chartWidth = (pageWidth - 2 * margin - 10) / 2; // Width for two charts side-by-side
      const chartHeight = chartWidth * 0.75; // Maintain aspect ratio
      let yPos = margin;

      // Add Title
      pdf.setFontSize(18);
      pdf.text("SafeSpec - Safety Charts Report", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        yPos,
        { align: "center" },
      );
      yPos += 15;

      // Add charts (two per row)
      const addChartToPdf = (
        chartRef: React.RefObject<HTMLCanvasElement>,
        x: number,
        y: number,
      ) => {
        if (chartRef.current) {
          const imgData = chartRef.current.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", x, y, chartWidth, chartHeight);
        }
      };

      // Row 1
      addChartToPdf(incidentChartRef, margin, yPos);
      addChartToPdf(complianceChartRef, margin + chartWidth + 10, yPos);
      yPos += chartHeight + 15;

      // Check if next row fits
      if (yPos + chartHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      // Row 2
      addChartToPdf(trainingChartRef, margin, yPos);
      addChartToPdf(riskDistributionRef, margin + chartWidth + 10, yPos);
      // yPos += chartHeight + 15; // Update yPos if more content follows

      // Save the PDF
      pdf.save(
        `SafeSpec_Charts_Report_${timeRange}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      addToast({
        type: "success",
        title: "Export Successful",
        message: "Combined chart PDF generated.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast({
        type: "error",
        title: "Export Failed",
        message: "Could not generate the PDF report.",
      });
    } finally {
      // Use setTimeout to ensure UI updates before resetting state
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsExporting(false);
        }
      }, 500);
    }
  };

  return (
    <div className="dashboard-container safety-charts">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Safety Charts</h1>
        <div className="dashboard-actions">
          <select
            className="filter-select"
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTimeRange(e.target.value)
            }
            disabled={loading || isExporting}
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            className="dashboard-button primary"
            onClick={handleExportAll}
            disabled={loading || isExporting || !dataLoaded}
          >
            {isExporting ? (
              <>
                <div className="button-loader"></div>
                Exporting PDF...
              </>
            ) : (
              <>
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
                Export All Charts (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="chart-grid">
        {loading && (
          <div className="loading-overlay">
            <div className="loader"></div>
            <div className="loader-text">Loading chart data...</div>
          </div>
        )}

        {/* Incident Trend Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div className="card-title">Incident Trend</div>
            <div className="card-actions">
              <button
                className="action-button tooltip"
                onClick={() => handleDownload("incidents")}
                disabled={loading || isExporting || !dataLoaded}
              >
                <span className="tooltip-content">Download PNG</span>
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
            </div>
          </div>
          <div className="card-content chart-content">
            <canvas ref={incidentChartRef}></canvas>
          </div>
        </div>

        {/* Compliance Score Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div className="card-title">Compliance Score</div>
            <div className="card-actions">
              <button
                className="action-button tooltip"
                onClick={() => handleDownload("compliance")}
                disabled={loading || isExporting || !dataLoaded}
              >
                <span className="tooltip-content">Download PNG</span>
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
            </div>
          </div>
          <div className="card-content chart-content">
            <canvas ref={complianceChartRef}></canvas>
          </div>
        </div>

        {/* Training Completion Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div className="card-title">Training Completion</div>
            <div className="card-actions">
              <button
                className="action-button tooltip"
                onClick={() => handleDownload("training")}
                disabled={loading || isExporting || !dataLoaded}
              >
                <span className="tooltip-content">Download PNG</span>
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
            </div>
          </div>
          <div className="card-content chart-content">
            <canvas ref={trainingChartRef}></canvas>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div className="card-title">Risk Distribution</div>
            <div className="card-actions">
              <button
                className="action-button tooltip"
                onClick={() => handleDownload("risk")}
                disabled={loading || isExporting || !dataLoaded}
              >
                <span className="tooltip-content">Download PNG</span>
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
            </div>
          </div>
          <div className="card-content chart-content">
            <canvas ref={riskDistributionRef}></canvas>
          </div>
        </div>
      </div>

      {/* Add specific styles */}
      <style>{`
        .safety-charts .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          position: relative; /* For loading overlay */
        }
        .safety-charts .chart-card {
          display: flex;
          flex-direction: column;
        }
        .safety-charts .chart-content {
          flex-grow: 1;
          position: relative;
          min-height: 300px; /* Ensure charts have a minimum height */
        }
        .safety-charts .chart-content canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .safety-charts .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          border-radius: var(--border-radius);
        }
        .safety-charts .loader {
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        .safety-charts .loader-text {
          margin-top: 1rem;
          color: var(--text-secondary);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .safety-charts .dashboard-button .button-loader {
          display: inline-block;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default SafetyCharts;
