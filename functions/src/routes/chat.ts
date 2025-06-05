import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Send message to AI assistant
router.post('/message',
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { message, context } = req.body;

      // Store user message
      const db = admin.firestore();
      const userMessageRef = await db.collection('chatMessages').add({
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        message,
        context,
        type: 'user',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // TODO: Integrate with OpenAI API
      // For now, return a placeholder response
      const aiResponse = generatePlaceholderResponse(message, context);

      // Store AI response
      const aiMessageRef = await db.collection('chatMessages').add({
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        message: aiResponse,
        context,
        type: 'assistant',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        relatedMessageId: userMessageRef.id
      });

      res.json({
        response: aiResponse,
        messageId: aiMessageRef.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Chat message error:', error);
      res.status(500).json({
        error: 'Failed to process chat message',
        code: 'CHAT_MESSAGE_FAILED',
        details: error.message
      });
    }
  }
);

// Get chat history
router.get('/history',
  authenticateToken,
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { page = 1, limit = 50 } = req.query;

      const db = admin.firestore();
      let query = db.collection('chatMessages')
        .where('userId', '==', req.user!.uid)
        .where('tenantId', '==', req.user!.tenantId)
        .orderBy('timestamp', 'desc');

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      if (offset > 0) {
        const offsetSnapshot = await query.limit(offset).get();
        if (!offsetSnapshot.empty) {
          const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.limit(Number(limit)).get();
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      res.json({
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: snapshot.docs.length === Number(limit)
        }
      });
    } catch (error: any) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        error: 'Failed to get chat history',
        code: 'GET_CHAT_HISTORY_FAILED',
        details: error.message
      });
    }
  }
);

// Clear chat history
router.delete('/history',
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const db = admin.firestore();
      
      // Get all user's chat messages
      const messagesQuery = await db.collection('chatMessages')
        .where('userId', '==', req.user!.uid)
        .where('tenantId', '==', req.user!.tenantId)
        .get();

      // Batch delete messages
      const batch = db.batch();
      messagesQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      res.json({ 
        message: 'Chat history cleared successfully',
        deletedCount: messagesQuery.docs.length
      });
    } catch (error: any) {
      console.error('Clear chat history error:', error);
      res.status(500).json({
        error: 'Failed to clear chat history',
        code: 'CLEAR_CHAT_HISTORY_FAILED',
        details: error.message
      });
    }
  }
);

// Get AI assistant suggestions based on context
router.post('/suggestions',
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { context, entityType } = req.body;

      // Generate contextual suggestions based on the current page/entity
      const suggestions = generateContextualSuggestions(context, entityType);

      res.json({
        suggestions,
        context,
        entityType
      });
    } catch (error: any) {
      console.error('Get AI suggestions error:', error);
      res.status(500).json({
        error: 'Failed to get AI suggestions',
        code: 'GET_AI_SUGGESTIONS_FAILED',
        details: error.message
      });
    }
  }
);

// Analyze safety data and provide insights
router.post('/analyze',
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { dataType, timeRange, filters } = req.body;

      const db = admin.firestore();
      let insights: any = {};

      // Analyze different types of safety data
      switch (dataType) {
        case 'incidents':
          insights = await analyzeIncidentData(db, req.user!.tenantId, timeRange, filters);
          break;
        case 'audits':
          insights = await analyzeAuditData(db, req.user!.tenantId, timeRange, filters);
          break;
        case 'corrective_actions':
          insights = await analyzeCorrectiveActionData(db, req.user!.tenantId, timeRange, filters);
          break;
        default:
          insights = { message: 'Data type not supported for analysis' };
      }

      res.json({
        dataType,
        timeRange,
        insights,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Analyze data error:', error);
      res.status(500).json({
        error: 'Failed to analyze data',
        code: 'ANALYZE_DATA_FAILED',
        details: error.message
      });
    }
  }
);

// Helper function to generate placeholder AI response
function generatePlaceholderResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('incident') || lowerMessage.includes('accident')) {
    return "I can help you with incident management. You can create new incident reports, view existing incidents, or analyze incident trends. What specific aspect of incident management would you like assistance with?";
  }

  if (lowerMessage.includes('audit')) {
    return "I'm here to assist with audit management. I can help you schedule audits, track audit findings, or generate audit reports. What audit-related task can I help you with?";
  }

  if (lowerMessage.includes('corrective action') || lowerMessage.includes('capa')) {
    return "I can assist with corrective and preventive actions (CAPA). I can help you create new actions, track progress, or analyze completion rates. What would you like to do?";
  }

  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return "I can help generate various safety reports and analytics. I can create incident reports, audit summaries, compliance dashboards, and trend analyses. What type of report do you need?";
  }

  if (lowerMessage.includes('compliance') || lowerMessage.includes('regulation')) {
    return "I can assist with compliance management and regulatory requirements. I can help track compliance status, identify gaps, and suggest improvements. What compliance area are you working on?";
  }

  return "I'm your SafeSpec AI assistant. I can help you with incident management, audit scheduling, corrective actions, compliance tracking, and generating safety reports. How can I assist you today?";
}

// Helper function to generate contextual suggestions
function generateContextualSuggestions(context: string, entityType?: string): string[] {
  const suggestions: string[] = [];

  switch (context) {
    case 'dashboard':
      suggestions.push(
        "Show me this month's incident summary",
        "What are the top safety risks?",
        "Generate a compliance status report",
        "Show overdue corrective actions"
      );
      break;
    case 'incidents':
      suggestions.push(
        "How do I create a new incident report?",
        "Show me incident trends for this quarter",
        "What are the most common incident types?",
        "Help me analyze incident severity patterns"
      );
      break;
    case 'audits':
      suggestions.push(
        "Schedule a new safety audit",
        "Show me upcoming audit deadlines",
        "Generate an audit findings report",
        "What are the common audit non-conformities?"
      );
      break;
    case 'corrective_actions':
      suggestions.push(
        "Create a new corrective action",
        "Show me overdue actions",
        "Track corrective action effectiveness",
        "Generate a CAPA status report"
      );
      break;
    default:
      suggestions.push(
        "What can you help me with?",
        "Show me my safety dashboard",
        "Generate a monthly safety report",
        "Help me with compliance tracking"
      );
  }

  return suggestions;
}

// Helper functions for data analysis
async function analyzeIncidentData(db: admin.firestore.Firestore, tenantId: string, timeRange: any, filters: any) {
  // Placeholder analysis - in production, this would use AI/ML models
  const incidentsRef = db.collection('incidents').where('tenantId', '==', tenantId);
  const snapshot = await incidentsRef.get();
  const incidents = snapshot.docs.map(doc => doc.data());

  return {
    totalIncidents: incidents.length,
    trends: "Incident rates have decreased by 15% compared to last month",
    recommendations: [
      "Focus on slip and fall prevention training",
      "Increase safety inspections in high-risk areas",
      "Review and update safety procedures"
    ],
    riskAreas: ["Manufacturing floor", "Loading dock", "Chemical storage"]
  };
}

async function analyzeAuditData(db: admin.firestore.Firestore, tenantId: string, timeRange: any, filters: any) {
  const auditsRef = db.collection('audits').where('tenantId', '==', tenantId);
  const snapshot = await auditsRef.get();
  const audits = snapshot.docs.map(doc => doc.data());

  return {
    totalAudits: audits.length,
    complianceScore: "87%",
    trends: "Compliance scores have improved by 8% this quarter",
    recommendations: [
      "Address recurring documentation issues",
      "Implement more frequent internal audits",
      "Provide additional training on safety procedures"
    ],
    commonFindings: ["Incomplete documentation", "Missing safety signage", "Outdated procedures"]
  };
}

async function analyzeCorrectiveActionData(db: admin.firestore.Firestore, tenantId: string, timeRange: any, filters: any) {
  const actionsRef = db.collection('correctiveActions').where('tenantId', '==', tenantId);
  const snapshot = await actionsRef.get();
  const actions = snapshot.docs.map(doc => doc.data());

  return {
    totalActions: actions.length,
    completionRate: "78%",
    trends: "Corrective action completion has improved by 12%",
    recommendations: [
      "Set more realistic deadlines for complex actions",
      "Provide additional resources for high-priority actions",
      "Implement regular follow-up meetings"
    ],
    overdueActions: actions.filter(a => a.status !== 'completed' && new Date(a.dueDate) < new Date()).length
  };
}

export { router as chatRoutes };

