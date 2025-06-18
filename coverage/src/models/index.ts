/**
 * TypeScript interfaces and types for the SafeSpec OHS application
 */

// User related interfaces
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: Permission[];
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  VIEWER = "viewer",
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

// Authentication related interfaces
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

// Incident related interfaces
export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  reportedBy: User;
  assignedTo?: User;
  status: IncidentStatus;
  severity: IncidentSeverity;
  type: IncidentType;
  images?: string[];
  documents?: Document[];
  correctiveActions?: CorrectiveAction[];
  witnesses?: Witness[];
  createdAt: string;
  updatedAt: string;
  isOffline?: boolean;
}

export enum IncidentStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  UNDER_REVIEW = "under_review",
  CLOSED = "closed",
}

export enum IncidentSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum IncidentType {
  INJURY = "injury",
  NEAR_MISS = "near_miss",
  PROPERTY_DAMAGE = "property_damage",
  ENVIRONMENTAL = "environmental",
  SECURITY = "security",
  OTHER = "other",
}

export interface Witness {
  id: string;
  name: string;
  contact: string;
  statement: string;
}

// Document related interfaces
export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  tags?: string[];
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
  version: number;
  previousVersions?: DocumentVersion[];
  isOffline?: boolean;
}

export enum DocumentCategory {
  POLICY = "policy",
  PROCEDURE = "procedure",
  FORM = "form",
  REPORT = "report",
  TRAINING = "training",
  OTHER = "other",
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileUrl: string;
  updatedBy: User;
  updatedAt: string;
  changeNotes?: string;
}

// Corrective Action related interfaces
export interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  incidentId?: string;
  assignedTo: User;
  approvedBy?: User;
  status: CorrectiveActionStatus;
  priority: CorrectivePriority;
  dueDate: string;
  completedDate?: string;
  verifiedDate?: string;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
  isOffline?: boolean;
}

export enum CorrectiveActionStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  VERIFIED = "verified",
  OVERDUE = "overdue",
}

export enum CorrectivePriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// Report related interfaces
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  dateRange?: {
    start: string;
    end: string;
  };
  parameters?: Record<string, any>;
  fileUrl?: string;
  charts?: Chart[];
  isScheduled?: boolean;
  scheduleFrequency?: ScheduleFrequency;
  lastRun?: string;
  nextRun?: string;
}

export enum ReportType {
  INCIDENT = "incident",
  COMPLIANCE = "compliance",
  SAFETY_METRICS = "safety_metrics",
  CUSTOM = "custom",
}

export enum ScheduleFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
}

export interface Chart {
  id: string;
  type: ChartType;
  title: string;
  data: any;
  options?: any;
}

export enum ChartType {
  BAR = "bar",
  LINE = "line",
  PIE = "pie",
  DOUGHNUT = "doughnut",
  RADAR = "radar",
  TABLE = "table",
}

// Notification related interfaces
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  entityId?: string;
  entityType?: EntityType;
  userId: string;
}

export enum NotificationType {
  INCIDENT = "incident",
  TASK = "task",
  SYSTEM = "system",
  DOCUMENT = "document",
}

export enum EntityType {
  INCIDENT = "incident",
  CORRECTIVE_ACTION = "corrective_action",
  DOCUMENT = "document",
  REPORT = "report",
  USER = "user",
}

// Settings related interfaces
export interface Settings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  data: DataSettings;
  regional: RegionalSettings;
  accessibility: AccessibilitySettings;
}

export interface GeneralSettings {
  companyName: string;
  logo?: string;
  theme: "light" | "dark" | "system";
  language: string;
  dashboardLayout: any;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: "none" | "daily" | "weekly";
  incidentAlerts: boolean;
  taskReminders: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordExpiry: number;
  sessionTimeout: number;
  ipRestriction: boolean;
  allowedIPs?: string[];
}

export interface DataSettings {
  autoSync: boolean;
  syncFrequency: number;
  offlineStorage: boolean;
  offlineStorageLimit: number;
  dataRetention: number;
}

export interface RegionalSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: number;
  measurementSystem: "metric" | "imperial";
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

// AI related interfaces
export interface AIMessage {
  id: string;
  content: string;
  type: AIMessageType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum AIMessageType {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface AIAnalysisResult {
  id: string;
  documentId: string;
  summary: string;
  insights: string[];
  complianceScore?: number;
  risks?: AIRisk[];
  recommendations?: string[];
  createdAt: string;
}

export interface AIRisk {
  description: string;
  severity: "high" | "medium" | "low";
  relatedRegulations?: string[];
}

// Offline related interfaces
export interface SyncStatus {
  lastSyncTime: string | null;
  isSyncing: boolean;
  pendingChanges: number;
  entities: {
    incidents: number;
    documents: number;
    correctiveActions: number;
  };
}

export interface OfflineChange {
  id: string;
  entityId: string;
  entityType: EntityType;
  operation: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  synced: boolean;
  syncError?: string;
}

// Tenant related interfaces
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: "basic" | "professional" | "enterprise";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: TenantSettings;
  customization: TenantCustomization;
}

export interface TenantSettings {
  maxUsers: number;
  maxStorage: number;
  features: {
    aiAssistant: boolean;
    advancedReporting: boolean;
    multiSite: boolean;
    apiAccess: boolean;
  };
}

export interface TenantCustomization {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
}

// API related interfaces
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}

export * from "./ComplianceItem";
export * from "./ComplianceCategory";
export * from "./Inspection";
export * from "./ai";
export * from "./AppUser";
export * from "./RegisterData";
