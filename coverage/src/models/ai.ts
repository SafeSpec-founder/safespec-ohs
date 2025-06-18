/**
 * AI-related TypeScript interfaces and types for the SafeSpec OHS application
 */

// AI Message types
export type AIMessageType = "user" | "assistant" | "system";

// AI Assistant interfaces
export interface AIMessage {
  id: string;
  role: AIMessageType;
  content: string;
  timestamp: Date;
  type?: string;
  error?: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
    error?: string;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  context?: AIContext;
}

export interface AIContext {
  type: "incident" | "document" | "compliance" | "risk" | "general";
  entityId?: string;
  metadata?: Record<string, any>;
}

export interface AIAssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enabledFeatures: AIFeature[];
}

export enum AIFeature {
  INCIDENT_ANALYSIS = "incident_analysis",
  COMPLIANCE_CHECK = "compliance_check",
  RISK_ASSESSMENT = "risk_assessment",
  DOCUMENT_REVIEW = "document_review",
  SAFETY_RECOMMENDATIONS = "safety_recommendations",
  TRAINING_SUGGESTIONS = "training_suggestions",
}

export interface AIAnalysisResult {
  id: string;
  type: AIFeature;
  input: string;
  result: {
    summary: string;
    details: string;
    confidence: number;
    recommendations: string[];
    risks?: RiskLevel[];
    compliance?: ComplianceStatus[];
  };
  timestamp: Date;
  processingTime: number;
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ComplianceStatus {
  standard: string;
  status: "compliant" | "non_compliant" | "partial" | "unknown";
  details: string;
  recommendations?: string[];
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: AIFeature;
  isActive: boolean;
}

export interface AIUsageMetrics {
  userId: string;
  date: string;
  requestCount: number;
  tokensUsed: number;
  averageResponseTime: number;
  featureUsage: Record<AIFeature, number>;
}

// AI Service interfaces
export interface AIServiceConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
  retryAttempts: number;
}

export interface AIRequest {
  prompt: string;
  context?: AIContext;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}

export interface AIResponse {
  content: string;
  confidence: number;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    timestamp: Date;
  };
  error?: string;
}

export interface AIStreamResponse {
  chunk: string;
  isComplete: boolean;
  metadata?: Partial<AIResponse["metadata"]>;
}

// AI Training and Learning interfaces
export interface AIFeedback {
  id: string;
  messageId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  timestamp: Date;
  category: "accuracy" | "helpfulness" | "relevance" | "safety";
}

export interface AIKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  version: number;
  isActive: boolean;
}

export interface AITrainingData {
  id: string;
  input: string;
  expectedOutput: string;
  category: AIFeature;
  quality: "high" | "medium" | "low";
  verified: boolean;
  createdAt: Date;
}

// AI Automation interfaces
export interface AIAutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "incident" | "document" | "schedule" | "threshold";
    conditions: Record<string, any>;
  };
  action: {
    type: "analysis" | "notification" | "report" | "escalation";
    parameters: Record<string, any>;
  };
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;
}

export interface AIAutomationExecution {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  completedAt?: Date;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
}

// Export all AI-related types
export type AIEntity =
  | AIMessage
  | AIConversation
  | AIAnalysisResult
  | AIPromptTemplate
  | AIFeedback
  | AIKnowledgeBase
  | AITrainingData
  | AIAutomationRule
  | AIAutomationExecution;
