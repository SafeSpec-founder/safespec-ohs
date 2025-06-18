import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AIRequest {
  prompt: string;
  context?: string;
  type: "chat" | "analysis" | "recommendation" | "summary";
}

export interface AIResponse {
  id: string;
  response: string;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const aiService = {
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    const response = await api.post("/ai/chat", request);
    return response.data;
  },

  async analyzeDocument(
    documentId: string,
    analysisType: string,
  ): Promise<AIResponse> {
    const response = await api.post("/ai/analyze", {
      documentId,
      analysisType,
    });
    return response.data;
  },

  async getRecommendations(context: string, type: string): Promise<AIResponse> {
    const response = await api.post("/ai/recommendations", {
      context,
      type,
    });
    return response.data;
  },

  async summarizeContent(
    content: string,
    maxLength?: number,
  ): Promise<AIResponse> {
    const response = await api.post("/ai/summarize", {
      content,
      maxLength,
    });
    return response.data;
  },

  async getChatHistory(sessionId?: string): Promise<AIResponse[]> {
    const params = sessionId ? `?sessionId=${sessionId}` : "";
    const response = await api.get(`/ai/history${params}`);
    return response.data;
  },

  async getEntity(entityType: string, entityId: string): Promise<any> {
    const response = await api.get(`/ai/entity/${entityType}/${entityId}`);
    return response.data;
  },

  async analyzeEntity(entityType: string, entityId: string): Promise<any> {
    const response = await api.post("/ai/analyze-entity", {
      entityType,
      entityId,
    });
    return response.data;
  },

  async generateRecommendations(
    entityType: string,
    entityId: string,
  ): Promise<any> {
    const response = await api.post("/ai/recommendations", {
      entityType,
      entityId,
    });
    return response.data;
  },
};
