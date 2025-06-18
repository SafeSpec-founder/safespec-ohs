/**
 * ComplianceCategory interface for SafeSpec OHS Application
 */

import { ComplianceItem } from "./ComplianceItem";

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  items: ComplianceItem[];
  parentId?: string;
  children?: ComplianceCategory[];
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  icon?: string;
  color?: string;
  regulatoryFramework?: string;
  compliancePercentage?: number;
  totalItems?: number;
  compliantItems?: number;
  nonCompliantItems?: number;
  inProgressItems?: number;
  notApplicableItems?: number;
}

export interface ComplianceCategoryUpdate {
  name?: string;
  description?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  icon?: string;
  color?: string;
  regulatoryFramework?: string;
}

export interface ComplianceCategoryFilters {
  parentId?: string;
  isActive?: boolean;
  regulatoryFramework?: string;
  search?: string;
}

export interface ComplianceCategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalItems: number;
  overallCompliancePercentage: number;
  categoriesWithIssues: number;
}
