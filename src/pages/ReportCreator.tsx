import React, { useState } from "react";
import { logger } from "../utils/logger";
import { useToast } from "../contexts/ToastContext";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";

interface ReportData {
  id: string;
  title: string;
  type: string;
  department: string;
  createdAt: string;
  status: string;
  [key: string]: any; // For dynamic fields
}

const ReportCreator: React.FC = () => {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState<string>("incident");
  const [dateRange, setDateRange] = useState<string>("last7days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [availableDepartments] = useState<string[]>([
    "Operations",
    "Maintenance",
    "Safety",
    "Administration",
    "Warehouse",
    "Production",
    "Quality Control",
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeRawData, setIncludeRawData] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(
    null,
  );

  // Fetch report data based on filters
  const fetchReportData = async (
    type: string,
    range: string,
    startDate: string,
    endDate: string,
    departments: string[],
  ): Promise<ReportData[]> => {
    setIsLoading(true);

    try {
      // Determine collection based on report type
      let collectionName = "";
      switch (type) {
        case "incident":
          collectionName = "incidents";
          break;
        case "inspection":
          collectionName = "inspections";
          break;
        case "compliance":
          collectionName = "compliance";
          break;
        case "training":
          collectionName = "training";
          break;
        default:
          collectionName = "incidents";
      }

      // Calculate date range
      let startDateTime = new Date();
      let endDateTime = new Date();

      switch (range) {
        case "today":
          startDateTime.setHours(0, 0, 0, 0);
          break;
        case "yesterday":
          startDateTime.setDate(startDateTime.getDate() - 1);
          startDateTime.setHours(0, 0, 0, 0);
          endDateTime = new Date(startDateTime);
          endDateTime.setHours(23, 59, 59, 999);
          break;
        case "last7days":
          startDateTime.setDate(startDateTime.getDate() - 7);
          startDateTime.setHours(0, 0, 0, 0);
          break;
        case "last30days":
          startDateTime.setDate(startDateTime.getDate() - 30);
          startDateTime.setHours(0, 0, 0, 0);
          break;
        case "custom":
          if (startDate) {
            startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0);
          }
          if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
          }
          break;
        default:
          startDateTime.setDate(startDateTime.getDate() - 7);
          startDateTime.setHours(0, 0, 0, 0);
      }

      // Build query
      let q = query(
        collection(db, collectionName),
        orderBy("createdAt", "desc"),
      );

      // Add date range filter
      if (range !== "all") {
        q = query(
          collection(db, collectionName),
          where("createdAt", ">=", Timestamp.fromDate(startDateTime)),
          where("createdAt", "<=", Timestamp.fromDate(endDateTime)),
          orderBy("createdAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);

      // Process results
      const results: ReportData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Filter by department if departments are selected
        if (departments.length > 0 && !departments.includes(data.department)) {
          return;
        }

        // Format date
        const createdAt =
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toLocaleDateString()
            : "Unknown date";

        results.push({
          id: doc.id,
          title: data.title || "Untitled",
          type: data.type || "Unknown",
          department: data.department || "Unassigned",
          createdAt,
          status: data.status || "Unknown",
          ...data, // Include all other fields
        });
      });

      return results;
    } catch (error) {
      console.error("Error fetching report data:", error);
      addToast({
        type: "error",
        title: "Data Error",
        message: "Failed to fetch report data. Please try again.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Handle department selection
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(department)) {
        return prev.filter((d) => d !== department);
      } else {
        return [...prev, department];
      }
    });
  };

  // Handle select all departments
  const handleSelectAllDepartments = () => {
    if (selectedDepartments.length === availableDepartments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments([...availableDepartments]);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (dateRange === "custom" && (!customStartDate || !customEndDate)) {
      addToast({
        type: "warning",
        title: "Missing Dates",
        message: "Please select both start and end dates for custom range.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch data
      const data = await fetchReportData(
        reportType,
        dateRange,
        customStartDate,
        customEndDate,
        selectedDepartments,
      );

      setReportData(data);

      // Generate report based on format
      if (data.length === 0) {
        addToast({
          type: "info",
          title: "No Data",
          message: "No data found for the selected filters.",
        });
        setIsGenerating(false);
        return;
      }

      // In a real app, this would call a backend API to generate the report
      // For this demo, we'll simulate report generation
      setTimeout(() => {
        // Simulate report URL
        const reportUrl = `#/generated-report-${Date.now()}.${reportFormat}`;
        setGeneratedReportUrl(reportUrl);

        addToast({
          type: "success",
          title: "Report Generated",
          message: `Your ${reportType} report has been generated successfully.`,
        });

        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating report:", error);
      addToast({
        type: "error",
        title: "Generation Error",
        message: "Failed to generate report. Please try again.",
      });
      setIsGenerating(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF
    // For this demo, we'll simulate PDF generation
    addToast({
      type: "info",
      title: "Exporting PDF",
      message: "Preparing PDF document...",
    });

    setTimeout(() => {
      addToast({
        type: "success",
        title: "PDF Ready",
        message: "Your PDF has been generated and is ready for download.",
      });
    }, 2000);
  };

  // Export to Excel
  const exportToExcel = () => {
    // In a real app, this would generate an Excel file using a library like xlsx
    // For this demo, we'll simulate Excel generation
    addToast({
      type: "info",
      title: "Exporting Excel",
      message: "Preparing Excel document...",
    });

    setTimeout(() => {
      addToast({
        type: "success",
        title: "Excel Ready",
        message:
          "Your Excel file has been generated and is ready for download.",
      });
    }, 2000);
  };

  // Generate document
  const generateDocument = () => {
    if (reportData.length === 0) {
      addToast({
        type: "warning",
        title: "No Data",
        message: "Please generate a report first.",
      });
      return;
    }

    // Process data for document generation
    const processedData = reportData.map((item) => {
      // Transform data as needed for the document
      return {
        ID: item.id,
        Title: item.title,
        Department: item.department,
        Date: item.createdAt,
        Status: item.status,
      };
    });

    // Generate document based on format
    if (reportFormat === "pdf") {
      // For PDF generation
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

      // In a real app, this would use jsPDF or a similar library
      // For this demo, we'll simulate PDF structure

      // Header
      const header = [["ID", "Title", "Department", "Date", "Status"]];

      // Body
      const body = processedData.map((row: Record<string, string>) =>
        Object.values(row),
      );

      // Charts (if included)
      const charts = includeCharts ? "Charts would be included here" : "";

      // Raw data (if included)
      const rawData = includeRawData ? "Raw data would be included here" : "";

      logger.info("PDF Structure:", {
        title,
        subtitle,
        header,
        body,
        charts,
        rawData,
      });

      exportToPDF();
    } else if (reportFormat === "excel") {
      // For Excel generation
      exportToExcel();
    } else if (reportFormat === "csv") {
      // For CSV generation
      const header = Object.keys(processedData[0]).join(",");
      const rows = processedData.map((row) => Object.values(row).join(","));
      const csv = [header, ...rows].join("\n");

      logger.info("CSV Content:", csv);

      // In a real app, this would trigger a download
      addToast({
        type: "success",
        title: "CSV Ready",
        message: "Your CSV file has been generated and is ready for download.",
      });
    }
  };

  return (
    <div className="dashboard-container report-creator-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Report Creator</h1>
      </div>

      {/* Report Configuration */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Configure Report</h2>
        </div>
        <div className="card-content">
          <div className="form-grid">
            {/* Report Type */}
            <div className="form-group">
              <label htmlFor="reportType">Report Type</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-control"
              >
                <option value="incident">Incident Report</option>
                <option value="inspection">Inspection Report</option>
                <option value="compliance">Compliance Report</option>
                <option value="training">Training Report</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="form-group">
              <label htmlFor="dateRange">Date Range</label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-control"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </>
            )}

            {/* Report Format */}
            <div className="form-group">
              <label htmlFor="reportFormat">Report Format</label>
              <select
                id="reportFormat"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                className="form-control"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            {/* Include Charts */}
            <div className="form-group checkbox-group">
              <input
                id="includeCharts"
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="includeCharts">Include Charts</label>
            </div>

            {/* Include Raw Data */}
            <div className="form-group checkbox-group">
              <input
                id="includeRawData"
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="includeRawData">Include Raw Data</label>
            </div>
          </div>
        </div>
      </div>

      {/* Department Selection */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Select Departments</h2>
          <div className="card-actions">
            <button
              className="dashboard-button small"
              onClick={handleSelectAllDepartments}
            >
              {selectedDepartments.length === availableDepartments.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="departments-grid">
            {availableDepartments.map((department) => (
              <div key={department} className="department-checkbox">
                <input
                  id={`dept-${department}`}
                  type="checkbox"
                  checked={selectedDepartments.includes(department)}
                  onChange={() => handleDepartmentChange(department)}
                  className="form-checkbox"
                />
                <label htmlFor={`dept-${department}`}>{department}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="dashboard-actions center">
        <button
          className="dashboard-button primary large"
          onClick={handleGenerateReport}
          disabled={isGenerating || isLoading}
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
        {reportData.length > 0 && (
          <button
            className="dashboard-button secondary large"
            onClick={generateDocument}
            disabled={isGenerating || isLoading}
          >
            Export Document
          </button>
        )}
      </div>

      {/* Report Preview */}
      {reportData.length > 0 && (
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Report Preview</h2>
            <div className="card-actions">
              <span className="record-count">{reportData.length} records</span>
            </div>
          </div>
          <div className="card-content no-padding">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.department}</td>
                      <td>{item.createdAt}</td>
                      <td>
                        <span
                          className={`badge badge-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Link */}
      {generatedReportUrl && (
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Generated Report</h2>
          </div>
          <div className="card-content">
            <div className="generated-report-link">
              <p>
                Your report has been generated successfully. Click the button
                below to download it.
              </p>
              <a
                href={generatedReportUrl}
                className="dashboard-button primary"
                download={`${reportType}-report-${Date.now()}.${reportFormat}`}
              >
                Download Report
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCreator;
