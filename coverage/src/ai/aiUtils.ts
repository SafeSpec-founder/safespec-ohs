import { AIMessage } from "@models/ai";

/**
 * Utility functions for AI message processing and formatting
 */
export const aiUtils = {
  /**
   * Format AI response for display
   * @param response Raw AI response
   * @returns Formatted message
   */
  formatResponse(response: any): AIMessage {
    return {
      id: response.id || `msg_${Date.now()}`,
      role: "assistant",
      content: response.content || response.message || "",
      timestamp: new Date(response.timestamp || Date.now()),
      metadata: response.metadata || {},
    };
  },

  /**
   * Format user message for sending to AI
   * @param message User message content
   * @returns Formatted message
   */
  formatUserMessage(message: string): AIMessage {
    return {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
      metadata: {},
    };
  },

  /**
   * Extract key insights from AI response
   * @param response AI response
   * @returns Array of key insights
   */
  extractInsights(response: any): string[] {
    if (!response || !response.insights) {
      return [];
    }
    return Array.isArray(response.insights)
      ? response.insights
      : [response.insights];
  },

  /**
   * Check if the AI response contains safety warnings
   * @param response AI response
   * @returns Boolean indicating if warnings are present
   */
  hasSafetyWarnings(response: any): boolean {
    return (
      response &&
      response.metadata &&
      response.metadata.warnings &&
      response.metadata.warnings.length > 0
    );
  },

  /**
   * Extract safety warnings from AI response
   * @param response AI response
   * @returns Array of safety warnings
   */
  extractSafetyWarnings(response: any): string[] {
    if (!response || !response.metadata || !response.metadata.warnings) {
      return [];
    }
    return Array.isArray(response.metadata.warnings)
      ? response.metadata.warnings
      : [response.metadata.warnings];
  },

  /**
   * Generate prompt for document analysis
   * @param documentType Type of document
   * @param context Additional context
   * @returns Formatted prompt
   */
  generateAnalysisPrompt(documentType: string, context?: any): string {
    const basePrompt = `Analyze this ${documentType} document for compliance with safety regulations`;

    if (!context) {
      return basePrompt;
    }

    let additionalContext = "";

    if (context.industry) {
      additionalContext += ` in the ${context.industry} industry`;
    }

    if (context.jurisdiction) {
      additionalContext += ` according to ${context.jurisdiction} regulations`;
    }

    if (context.specificRequirements) {
      additionalContext += `. Focus on ${context.specificRequirements}`;
    }

    return basePrompt + additionalContext + ".";
  },

  /**
   * Generate prompt for corrective action recommendations
   * @param incident Incident data
   * @returns Formatted prompt
   */
  generateRecommendationsPrompt(incident: any): string {
    return `Based on this incident involving ${incident.type || "safety issue"} 
    with severity level ${incident.severity || "unknown"}, 
    recommend appropriate corrective actions to prevent recurrence.`;
  },

  /**
   * Check if AI response contains actionable items
   * @param response AI response
   * @returns Boolean indicating if actionable items are present
   */
  hasActionableItems(response: any): boolean {
    return (
      response &&
      response.metadata &&
      response.metadata.actionItems &&
      response.metadata.actionItems.length > 0
    );
  },

  /**
   * Extract actionable items from AI response
   * @param response AI response
   * @returns Array of actionable items
   */
  extractActionableItems(response: any): string[] {
    if (!response || !response.metadata || !response.metadata.actionItems) {
      return [];
    }
    return Array.isArray(response.metadata.actionItems)
      ? response.metadata.actionItems
      : [response.metadata.actionItems];
  },
};

export default aiUtils;
