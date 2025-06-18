import { AIMessage } from "@models/ai";
import aiAssistantService from "./aiAssistantService";
import aiUtils from "./aiUtils";

/**
 * AI Assistant model for managing conversation state and interactions
 */
export class AIAssistant {
  private messages: AIMessage[] = [];
  private context: any = {};
  private isProcessing = false;

  /**
   * Initialize a new AI Assistant instance
   * @param initialContext Optional initial context
   */
  constructor(initialContext: any = {}) {
    this.context = {
      ...initialContext,
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send a message to the AI assistant
   * @param message User message content
   * @returns Promise resolving to AI response
   */
  async sendMessage(message: string): Promise<AIMessage> {
    if (this.isProcessing) {
      throw new Error("Already processing a message");
    }

    try {
      this.isProcessing = true;

      // Format and add user message to conversation history
      const userMessage = aiUtils.formatUserMessage(message);
      this.messages.push(userMessage);

      // Send message to AI service
      const response = await aiAssistantService.sendMessage(message, {
        context: this.context,
        history: this.messages.slice(-10), // Send last 10 messages for context
      });

      // Format and add AI response to conversation history
      const aiMessage = aiUtils.formatResponse(response);
      this.messages.push(aiMessage);

      // Update context with any new information
      if (response.context) {
        this.context = {
          ...this.context,
          ...response.context,
        };
      }

      return aiMessage;
    } catch (error) {
      console.error("Error in AI assistant:", error);

      // Create error message
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        role: "system",
        content:
          "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
        metadata: { error: "Processing error occurred" },
      };

      this.messages.push(errorMessage);
      return errorMessage;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get conversation history
   * @returns Array of messages
   */
  getMessages(): AIMessage[] {
    return [...this.messages];
  }

  /**
   * Clear conversation history
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Get current context
   * @returns Current context object
   */
  getContext(): any {
    return { ...this.context };
  }

  /**
   * Update context with new information
   * @param newContext New context information to merge
   */
  updateContext(newContext: any): void {
    this.context = {
      ...this.context,
      ...newContext,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Check if the assistant is currently processing a message
   * @returns Boolean indicating processing status
   */
  isProcessingMessage(): boolean {
    return this.isProcessing;
  }

  /**
   * Analyze a document using the AI assistant
   * @param documentContent Document content
   * @param documentType Document type
   * @returns Analysis results
   */
  async analyzeDocument(
    documentContent: string,
    documentType: string,
  ): Promise<any> {
    try {
      return await aiAssistantService.analyzeDocument(
        documentContent,
        documentType,
      );
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw error;
    }
  }

  /**
   * Generate safety report based on incident data
   * @param incidentData Incident data
   * @param reportType Report type
   * @returns Generated report
   */
  async generateSafetyReport(
    incidentData: any[],
    reportType: string,
  ): Promise<any> {
    try {
      return await aiAssistantService.generateSafetyReport(
        incidentData,
        reportType,
      );
    } catch (error) {
      console.error("Error generating safety report:", error);
      throw error;
    }
  }

  /**
   * Get corrective action recommendations for an incident
   * @param incidentData Incident data
   * @returns Recommended corrective actions
   */
  async getCorrectiveActionRecommendations(incidentData: any): Promise<any> {
    try {
      return await aiAssistantService.getCorrectiveActionRecommendations(
        incidentData,
      );
    } catch (error) {
      console.error("Error getting corrective action recommendations:", error);
      throw error;
    }
  }

  /**
   * Summarize a document
   * @param documentContent Document content
   * @returns Document summary
   */
  async summarizeDocument(documentContent: string): Promise<any> {
    try {
      return await aiAssistantService.summarizeDocument(documentContent);
    } catch (error) {
      console.error("Error summarizing document:", error);
      throw error;
    }
  }
}

export default AIAssistant;
