import axios from "axios";

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  category:
    | "operational"
    | "environmental"
    | "health"
    | "safety"
    | "financial"
    | "regulatory";
  severity: "low" | "medium" | "high" | "critical";
  probability: "rare" | "unlikely" | "possible" | "likely" | "certain";
  riskScore: number;
  status: "draft" | "active" | "under_review" | "approved" | "archived";
  assessedBy: string;
  assessedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  nextReviewDate: string;
  controls: RiskControl[];
  mitigationPlan?: MitigationPlan;
  attachments: string[];
  tags: string[];
  location: string;
  department: string;
  affectedPersonnel: number;
  regulatoryRequirements: string[];
}

export interface RiskControl {
  id: string;
  type: "preventive" | "detective" | "corrective";
  description: string;
  effectiveness: "low" | "medium" | "high";
  implementationStatus: "planned" | "in_progress" | "implemented" | "verified";
  responsiblePerson: string;
  dueDate: string;
  cost?: number;
}

export interface MitigationPlan {
  id: string;
  strategy: "avoid" | "mitigate" | "transfer" | "accept";
  actions: MitigationAction[];
  timeline: string;
  budget?: number;
  successCriteria: string[];
  monitoringPlan: string;
}

export interface MitigationAction {
  id: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "completed" | "overdue";
  dependencies: string[];
  resources: string[];
}

export interface RiskMatrix {
  severity: string;
  probability: string;
  score: number;
  level: "low" | "medium" | "high" | "critical";
  color: string;
}

export interface RiskReport {
  id: string;
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRisks: number;
    highRisks: number;
    newRisks: number;
    mitigatedRisks: number;
    overallRiskScore: number;
  };
  risksByCategory: Record<string, number>;
  risksBySeverity: Record<string, number>;
  topRisks: RiskAssessment[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Risk matrix configuration
const RISK_MATRIX: RiskMatrix[] = [
  {
    severity: "low",
    probability: "rare",
    score: 1,
    level: "low",
    color: "#4caf50",
  },
  {
    severity: "low",
    probability: "unlikely",
    score: 2,
    level: "low",
    color: "#4caf50",
  },
  {
    severity: "low",
    probability: "possible",
    score: 3,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "low",
    probability: "likely",
    score: 4,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "low",
    probability: "certain",
    score: 5,
    level: "high",
    color: "#f44336",
  },

  {
    severity: "medium",
    probability: "rare",
    score: 2,
    level: "low",
    color: "#4caf50",
  },
  {
    severity: "medium",
    probability: "unlikely",
    score: 4,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "medium",
    probability: "possible",
    score: 6,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "medium",
    probability: "likely",
    score: 8,
    level: "high",
    color: "#f44336",
  },
  {
    severity: "medium",
    probability: "certain",
    score: 10,
    level: "high",
    color: "#f44336",
  },

  {
    severity: "high",
    probability: "rare",
    score: 3,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "high",
    probability: "unlikely",
    score: 6,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "high",
    probability: "possible",
    score: 9,
    level: "high",
    color: "#f44336",
  },
  {
    severity: "high",
    probability: "likely",
    score: 12,
    level: "high",
    color: "#f44336",
  },
  {
    severity: "high",
    probability: "certain",
    score: 15,
    level: "critical",
    color: "#9c27b0",
  },

  {
    severity: "critical",
    probability: "rare",
    score: 4,
    level: "medium",
    color: "#ff9800",
  },
  {
    severity: "critical",
    probability: "unlikely",
    score: 8,
    level: "high",
    color: "#f44336",
  },
  {
    severity: "critical",
    probability: "possible",
    score: 12,
    level: "high",
    color: "#f44336",
  },
  {
    severity: "critical",
    probability: "likely",
    score: 16,
    level: "critical",
    color: "#9c27b0",
  },
  {
    severity: "critical",
    probability: "certain",
    score: 20,
    level: "critical",
    color: "#9c27b0",
  },
];

export const riskService = {
  // Risk Assessment CRUD operations
  async getRiskAssessments(
    params: {
      page?: number;
      limit?: number;
      filters?: {
        category?: string;
        severity?: string;
        status?: string;
        department?: string;
        location?: string;
        dateRange?: {
          startDate: string;
          endDate: string;
        };
      };
    } = {},
  ) {
    try {
      const response = await axios.post(`${API_BASE_URL}/risks`, params);
      return response.data;
    } catch (error) {
      console.error("Error fetching risk assessments:", error);
      throw error;
    }
  },

  async getRiskAssessment(id: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      throw error;
    }
  },

  // Alias for backward compatibility
  async getAssessment(id: string) {
    return this.getRiskAssessment(id);
  },

  async getCachedAssessment(id: string) {
    try {
      // Try to get from cache first
      const cached = localStorage.getItem(`risk_assessment_${id}`);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const cacheTime = new Date(parsedCache.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);

        // Return cached data if less than 5 minutes old
        if (diffMinutes < 5) {
          return parsedCache.data;
        }
      }

      // Fetch fresh data and cache it
      const data = await this.getRiskAssessment(id);
      localStorage.setItem(
        `risk_assessment_${id}`,
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }),
      );

      return data;
    } catch (error) {
      console.error("Error fetching cached risk assessment:", error);
      throw error;
    }
  },

  async updateAssessmentStatus(id: string, status: string, notes?: string) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/risks/${id}/status`, {
        status,
        notes,
        updatedAt: new Date().toISOString(),
      });

      // Clear cache for this assessment
      localStorage.removeItem(`risk_assessment_${id}`);

      return response.data;
    } catch (error) {
      console.error("Error updating assessment status:", error);
      throw error;
    }
  },

  async createRiskAssessment(
    riskData: Omit<RiskAssessment, "id" | "assessedAt" | "riskScore">,
  ) {
    try {
      const riskScore = this.calculateRiskScore(
        riskData.severity,
        riskData.probability,
      );
      const response = await axios.post(`${API_BASE_URL}/risks`, {
        ...riskData,
        riskScore,
        assessedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating risk assessment:", error);
      throw error;
    }
  },

  async updateRiskAssessment(id: string, updates: Partial<RiskAssessment>) {
    try {
      // Recalculate risk score if severity or probability changed
      if (updates.severity || updates.probability) {
        const currentRisk = await this.getRiskAssessment(id);
        const severity = updates.severity || currentRisk.severity;
        const probability = updates.probability || currentRisk.probability;
        updates.riskScore = this.calculateRiskScore(severity, probability);
      }

      const response = await axios.put(`${API_BASE_URL}/risks/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating risk assessment:", error);
      throw error;
    }
  },

  async deleteRiskAssessment(id: string) {
    try {
      await axios.delete(`${API_BASE_URL}/risks/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting risk assessment:", error);
      throw error;
    }
  },

  // Risk Controls
  async addRiskControl(riskId: string, control: Omit<RiskControl, "id">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/risks/${riskId}/controls`,
        control,
      );
      return response.data;
    } catch (error) {
      console.error("Error adding risk control:", error);
      throw error;
    }
  },

  async updateRiskControl(
    riskId: string,
    controlId: string,
    updates: Partial<RiskControl>,
  ) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/risks/${riskId}/controls/${controlId}`,
        updates,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating risk control:", error);
      throw error;
    }
  },

  async deleteRiskControl(riskId: string, controlId: string) {
    try {
      await axios.delete(
        `${API_BASE_URL}/risks/${riskId}/controls/${controlId}`,
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting risk control:", error);
      throw error;
    }
  },

  // Mitigation Plans
  async createMitigationPlan(riskId: string, plan: Omit<MitigationPlan, "id">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/risks/${riskId}/mitigation-plan`,
        plan,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating mitigation plan:", error);
      throw error;
    }
  },

  async updateMitigationPlan(
    riskId: string,
    planId: string,
    updates: Partial<MitigationPlan>,
  ) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/risks/${riskId}/mitigation-plan/${planId}`,
        updates,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating mitigation plan:", error);
      throw error;
    }
  },

  // Risk Analysis
  async getRiskMatrix() {
    return RISK_MATRIX;
  },

  calculateRiskScore(severity: string, probability: string): number {
    const matrixEntry = RISK_MATRIX.find(
      (entry) =>
        entry.severity === severity && entry.probability === probability,
    );
    return matrixEntry ? matrixEntry.score : 0;
  },

  getRiskLevel(score: number): string {
    if (score >= 16) return "critical";
    if (score >= 9) return "high";
    if (score >= 4) return "medium";
    return "low";
  },

  getRiskColor(level: string): string {
    switch (level) {
      case "critical":
        return "#9c27b0";
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#757575";
    }
  },

  // Risk Reports
  async generateRiskReport(params: {
    startDate: string;
    endDate: string;
    departments?: string[];
    categories?: string[];
    includeControls?: boolean;
    includeMitigationPlans?: boolean;
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/risks/reports/generate`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error generating risk report:", error);
      throw error;
    }
  },

  async getRiskReports(params: { page?: number; limit?: number } = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks/reports`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching risk reports:", error);
      throw error;
    }
  },

  async exportRiskReport(
    reportId: string,
    format: "pdf" | "excel" | "csv" = "pdf",
  ) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/risks/reports/${reportId}/export`,
        {
          params: { format },
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `risk-report-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Error exporting risk report:", error);
      throw error;
    }
  },

  // Risk Dashboard Data
  async getRiskDashboardData(
    params: {
      period?: "week" | "month" | "quarter" | "year";
      departments?: string[];
    } = {},
  ) {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks/dashboard`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching risk dashboard data:", error);
      throw error;
    }
  },

  // Risk Templates
  async getRiskTemplates() {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks/templates`);
      return response.data;
    } catch (error) {
      console.error("Error fetching risk templates:", error);
      throw error;
    }
  },

  async createRiskFromTemplate(
    templateId: string,
    customData: Partial<RiskAssessment>,
  ) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/risks/templates/${templateId}/create`,
        customData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating risk from template:", error);
      throw error;
    }
  },

  // Risk Notifications
  async subscribeToRiskNotifications(
    riskId: string,
    notificationTypes: string[],
  ) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/risks/${riskId}/notifications/subscribe`,
        {
          notificationTypes,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error subscribing to risk notifications:", error);
      throw error;
    }
  },

  async unsubscribeFromRiskNotifications(riskId: string) {
    try {
      await axios.delete(
        `${API_BASE_URL}/risks/${riskId}/notifications/unsubscribe`,
      );
      return { success: true };
    } catch (error) {
      console.error("Error unsubscribing from risk notifications:", error);
      throw error;
    }
  },

  // Bulk Operations
  async bulkUpdateRisks(riskIds: string[], updates: Partial<RiskAssessment>) {
    try {
      const response = await axios.put(`${API_BASE_URL}/risks/bulk-update`, {
        riskIds,
        updates,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating risks:", error);
      throw error;
    }
  },

  async bulkDeleteRisks(riskIds: string[]) {
    try {
      await axios.delete(`${API_BASE_URL}/risks/bulk-delete`, {
        data: { riskIds },
      });
      return { success: true };
    } catch (error) {
      console.error("Error bulk deleting risks:", error);
      throw error;
    }
  },
};

export default riskService;
