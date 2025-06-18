/**
 * ComplianceItem interface for SafeSpec OHS Application
 */

export interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  evidence?: string[];
  notes?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  complianceScore?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  regulatoryReference?: string;
  attachments?: string[];
  tags?: string[];
}

export interface ComplianceItemUpdate {
  name?: string;
  description?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  evidence?: string[];
  notes?: string;
  category?: string;
  complianceScore?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  regulatoryReference?: string;
  attachments?: string[];
  tags?: string[];
}

export interface ComplianceItemFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  category?: string;
  riskLevel?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}
