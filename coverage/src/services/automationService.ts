import api from "./api";
import { api as apiService } from "./apiService";

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "event" | "schedule" | "condition";
    config: any;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  status: "active" | "inactive" | "error";
}

export const automationService = {
  async getRules(): Promise<Rule[]> {
    try {
      const response = await apiService.get("/automation/rules");
      return response.data;
    } catch (error) {
      console.error("Error fetching automation rules:", error);
      throw error;
    }
  },

  async createRule(ruleData: Partial<Rule>): Promise<Rule> {
    try {
      const response = await apiService.post("/automation/rules", ruleData);
      return response.data;
    } catch (error) {
      console.error("Error creating automation rule:", error);
      throw error;
    }
  },

  async updateRule(ruleId: string, ruleData: Partial<Rule>): Promise<Rule> {
    try {
      const response = await apiService.put(
        `/automation/rules/${ruleId}`,
        ruleData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating automation rule:", error);
      throw error;
    }
  },

  async deleteRule(ruleId: string): Promise<void> {
    try {
      await apiService.delete(`/automation/rules/${ruleId}`);
    } catch (error) {
      console.error("Error deleting automation rule:", error);
      throw error;
    }
  },

  async runRule(ruleId: string): Promise<void> {
    try {
      await apiService.post(`/automation/rules/${ruleId}/run`);
    } catch (error) {
      console.error("Error running automation rule:", error);
      throw error;
    }
  },

  async getRuleHistory(ruleId: string): Promise<any[]> {
    try {
      const response = await apiService.get(
        `/automation/rules/${ruleId}/history`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching rule history:", error);
      throw error;
    }
  },
};
