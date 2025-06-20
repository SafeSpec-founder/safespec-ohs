export interface Inspection {
  id: string;
  name: string;
  title: string;
  description: string;
  type: "safety" | "quality" | "environmental" | "compliance";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  location: string;
  scheduledDate: string;
  completedDate?: string;
  completedAt?: string;
  items: InspectionItem[];
  findings: InspectionFinding[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isCompliant: boolean | null;
  notes?: string;
  evidence?: string[];
  severity?: "low" | "medium" | "high" | "critical";
  status?: string;
}

export interface InspectionFinding {
  id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  location: string;
  evidence: string[];
  correctiveActions: string[];
  status: "open" | "in-progress" | "resolved" | "closed" | "verified";
  assignedTo?: string;
  dueDate?: string;
  itemId?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Finding {
  id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  location: string;
  evidence: string[];
  correctiveActions: string[];
  status: "open" | "in-progress" | "resolved" | "verified";
  assignedTo?: string;
  dueDate?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  checklist: Omit<
    InspectionItem,
    "id" | "isCompliant" | "notes" | "evidence"
  >[];
}

export interface InspectionFilters {
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  location?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}
