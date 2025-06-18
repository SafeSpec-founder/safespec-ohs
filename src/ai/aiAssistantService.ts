import axios from "axios";
import { cacheResponse } from "@services/apiService";

/**
 * AI Assistant service for handling interactions with the AI backend
 */
class AIAssistantService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_AI_ASSISTANT_ENDPOINT ||
      "https://ai.safespec.com/api";
    this.apiKey = import.meta.env.VITE_AI_ASSISTANT_API_KEY || "";
  }

  /**
   * Send a message to the AI assistant and get a response
   * @param message User message
   * @param context Optional context information
   * @returns AI response
   */
  async sendMessage(message: string, context?: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat`,
        {
          message,
          context,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      // Cache the response for offline use
      await cacheResponse("ai_chat", response.data);

      return response.data;
    } catch (error) {
      console.error("Error sending message to AI assistant:", error);
      throw error;
    }
  }

  /**
   * Analyze a document using the AI assistant
   * @param documentContent Document content to analyze
   * @param documentType Type of document (policy, procedure, report, etc.)
   * @returns Analysis results
   */
  async analyzeDocument(
    documentContent: string,
    documentType: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/analyze`,
        {
          content: documentContent,
          type: documentType,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error analyzing document with AI assistant:", error);
      throw error;
    }
  }

  /**
   * Generate a safety report based on incident data
   * @param incidentData Incident data to analyze
   * @param reportType Type of report to generate
   * @returns Generated report
   */
  async generateSafetyReport(
    incidentData: any[],
    reportType: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/generate-report`,
        {
          incidents: incidentData,
          reportType,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error generating safety report with AI assistant:", error);
      throw error;
    }
  }

  /**
   * Get safety regulation information based on a query
   * @param query Search query for safety regulations
   * @param jurisdiction Optional jurisdiction filter
   * @returns Relevant safety regulation information
   */
  async getSafetyRegulations(
    query: string,
    jurisdiction?: string,
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/regulations`, {
        params: {
          query,
          jurisdiction,
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      // Cache the response for offline use
      await cacheResponse("safety_regulations", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching safety regulations:", error);
      throw error;
    }
  }

  /**
   * Get AI-generated recommendations for corrective actions based on an incident
   * @param incidentData Incident data
   * @returns Recommended corrective actions
   */
  async getCorrectiveActionRecommendations(incidentData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/recommendations`,
        {
          incident: incidentData,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error getting corrective action recommendations:", error);
      throw error;
    }
  }

  /**
   * Summarize a document using the AI assistant
   * @param documentContent Document content to summarize
   * @returns Document summary
   */
  async summarizeDocument(documentContent: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/summarize`,
        {
          content: documentContent,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error summarizing document with AI assistant:", error);
      throw error;
    }
  }
}

export const aiAssistantService = new AIAssistantService();
export default aiAssistantService;
