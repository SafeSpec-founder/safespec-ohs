/**
 * Audit Service for SafeSpec OHS Application
 * Handles audit-related API calls and data management
 */
import api from "./apiService";
import { logger } from "../utils/logger";

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  dueDate?: Date;
  completedDate?: Date;
  findings?: string[];
  recommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
  response?: string; // <-- Add this
  notes?: string; // <-- And this
  evidence?: any[]; // <-- Add this
}

export interface AuditChecklist {
  id: string;
  name: string;
  description: string;
  items: AuditItem[];
  category: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  checklist: AuditChecklist;
  status: "draft" | "in_review" | "approved" | "published";
  findings: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  auditor: string;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

class AuditService {
  private baseUrl = "/api/audits";

  // Audit Items
  async getAuditItems(): Promise<AuditItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/items`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit items: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching audit items:", error);
      // Return mock data for development
      return this.getMockAuditItems();
    }
  }

  async createAuditItem(
    item: Omit<AuditItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<AuditItem> {
    try {
      const response = await fetch(`${this.baseUrl}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Failed to create audit item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating audit item:", error);
      throw error;
    }
  }

  async updateAuditItem(
    id: string,
    updates: Partial<AuditItem>,
  ): Promise<AuditItem> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update audit item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating audit item:", error);
      throw error;
    }
  }

  async deleteAuditItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete audit item: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting audit item:", error);
      throw error;
    }
  }

  // Audit Checklists
  async getAuditChecklists(): Promise<AuditChecklist[]> {
    try {
      const response = await fetch(`${this.baseUrl}/checklists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audit checklists: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching audit checklists:", error);
      return this.getMockAuditChecklists();
    }
  }

  async createAuditChecklist(
    checklist: Omit<AuditChecklist, "id" | "createdAt" | "updatedAt">,
  ): Promise<AuditChecklist> {
    try {
      const response = await fetch(`${this.baseUrl}/checklists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checklist),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create audit checklist: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating audit checklist:", error);
      throw error;
    }
  }

  // Audit Reports
  async getAuditReports(): Promise<AuditReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audit reports: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching audit reports:", error);
      return this.getMockAuditReports();
    }
  }

  async createAuditReport(
    report: Omit<AuditReport, "id" | "createdAt" | "updatedAt">,
  ): Promise<AuditReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create audit report: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating audit report:", error);
      throw error;
    }
  }

  async updateAudit(id: string, updates: any): Promise<any> {
    // You may want to adjust the endpoint as needed
    const response = await api.put(`/audits/${id}`, updates);
    return response.data;
  }

  async createFinding(auditId: string, finding: any): Promise<any> {
    // You may want to adjust the endpoint as needed
    const response = await api.post(`/audits/${auditId}/findings`, finding);
    return response.data;
  }

  // Mock data for development
  private getMockAuditItems(): AuditItem[] {
    return [
      {
        id: "1",
        title: "Fire Safety Equipment Check",
        description: "Inspect all fire extinguishers and emergency exits",
        category: "Fire Safety",
        status: "pending",
        priority: "high",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "PPE Compliance Review",
        description:
          "Verify all employees have required personal protective equipment",
        category: "PPE",
        status: "in_progress",
        priority: "medium",
        assignedTo: "Safety Officer",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getMockAuditChecklists(): AuditChecklist[] {
    return [
      {
        id: "1",
        name: "Monthly Safety Audit",
        description: "Comprehensive monthly safety inspection checklist",
        category: "Safety",
        isTemplate: true,
        items: this.getMockAuditItems(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getMockAuditReports(): AuditReport[] {
    return [
      {
        id: "1",
        title: "Q1 2024 Safety Audit Report",
        description: "Quarterly safety audit findings and recommendations",
        checklist: this.getMockAuditChecklists()[0],
        status: "approved",
        findings: [
          "Fire extinguisher in Building A needs replacement",
          "Emergency exit signs require battery replacement",
        ],
        recommendations: [
          "Schedule immediate fire extinguisher replacement",
          "Implement monthly emergency lighting checks",
        ],
        riskLevel: "medium",
        auditor: "John Smith",
        reviewedBy: "Safety Manager",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getAudits(): Promise<AuditReport[]> {
    return this.getAuditReports();
  }

  async getTemplates(): Promise<AuditChecklist[]> {
    return this.getAuditChecklists().then((checklists) =>
      checklists.filter((checklist) => checklist.isTemplate),
    );
  }

  async getFindings(): Promise<string[]> {
    try {
      const reports = await this.getAuditReports();
      const allFindings: string[] = [];

      reports.forEach((report) => {
        if (report.findings) {
          allFindings.push(...report.findings);
        }
      });

      return allFindings;
    } catch (error) {
      console.error("Error fetching findings:", error);
      return [];
    }
  }

  async deleteAudit(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete audit: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting audit:", error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/checklists/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  async deleteFinding(id: string): Promise<void> {
    // Mock implementation - findings are typically part of reports
    logger.info(`Deleting finding ${id}`);
  }

  async getFilteredAudits(filters: any): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value as string);
        }
      });
      const response = await api.get(
        `/audits/filtered?${queryParams.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting filtered audits:", error);
      throw error;
    }
  }

  async scheduleAudit(auditData: any): Promise<any> {
    try {
      const response = await api.post("/audits/schedule", auditData);
      return response.data;
    } catch (error) {
      console.error("Error scheduling audit:", error);
      throw error;
    }
  }

  async getAuditDetails(id: string): Promise<any> {
    try {
      const response = await api.get(`/audits/${id}/details`);
      return response.data;
    } catch (error) {
      console.error("Error getting audit details:", error);
      throw error;
    }
  }

  async getTemplateDetails(id: string): Promise<any> {
    try {
      const response = await api.get(`/audit-templates/${id}/details`);
      return response.data;
    } catch (error) {
      console.error("Error getting template details:", error);
      throw error;
    }
  }

  async updateFindingStatus(findingId: string, status: string): Promise<any> {
    try {
      const response = await api.put(`/audit-findings/${findingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating finding status:", error);
      throw error;
    }
  }

  async completeAudit(id: string, completionData: any): Promise<any> {
    try {
      const response = await api.post(`/audits/${id}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error("Error completing audit:", error);
      throw error;
    }
  }

  async approveAudit(id: string, approvalData: any): Promise<any> {
    try {
      const response = await api.post(`/audits/${id}/approve`, approvalData);
      return response.data;
    } catch (error) {
      console.error("Error approving audit:", error);
      throw error;
    }
  }
}

// Export singleton instance
const auditService = new AuditService();
export default auditService;
