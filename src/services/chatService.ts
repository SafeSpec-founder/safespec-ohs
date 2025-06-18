import api, { cacheResponse } from "./apiService";
import { ChatMessage } from "@store/slices/chatSlice";

export const chatService = {
  async getConversations(): Promise<any[]> {
    const response = await api.get("/chat/conversations");

    // Cache the response for offline access
    await cacheResponse("/chat/conversations", response.data);

    return response.data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
    );

    // Cache the response for offline access
    await cacheResponse(
      `/chat/conversations/${conversationId}/messages`,
      response.data,
    );

    return response.data;
  },

  async sendMessage(
    conversationId: string | null,
    content: string,
    metadata?: any,
  ): Promise<any> {
    // If no conversation ID, create a new conversation
    if (!conversationId) {
      const response = await api.post("/chat/conversations", {
        title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
      });

      conversationId = response.data.id;

      // Return both the new conversation and the message response
      const messageResponse = await this.sendMessage(
        conversationId,
        content,
        metadata,
      );

      return {
        ...messageResponse,
        conversation: response.data,
        conversationId,
      };
    }

    // Send message to existing conversation
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      {
        content,
        metadata,
      },
    );

    return response.data;
  },

  async createConversation(title: string): Promise<any> {
    const response = await api.post("/chat/conversations", { title });
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/chat/conversations/${conversationId}`);
  },

  async renameConversation(
    conversationId: string,
    title: string,
  ): Promise<any> {
    const response = await api.put(`/chat/conversations/${conversationId}`, {
      title,
    });
    return response.data;
  },

  async summarizeDocument(documentId: string): Promise<{ summary: string }> {
    const response = await api.post("/chat/summarize", { documentId });
    return response.data;
  },

  async analyzeIncident(
    incidentId: string,
  ): Promise<{ analysis: string; recommendations: string[] }> {
    const response = await api.post("/chat/analyze-incident", { incidentId });
    return response.data;
  },

  async generateCorrectiveActions(
    incidentId: string,
  ): Promise<{ actions: string[] }> {
    const response = await api.post("/chat/generate-corrective-actions", {
      incidentId,
    });
    return response.data;
  },

  async askSafetyQuestion(
    question: string,
  ): Promise<{ answer: string; references: string[] }> {
    const response = await api.post("/chat/safety-question", { question });
    return response.data;
  },
};
