import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Generate incident report
router.post('/incidents',
  authenticateToken,
  requirePermission('reports.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { dateFrom, dateTo, filters, format = 'json' } = req.body;

      const db = admin.firestore();
      let query = db.collection('incidents')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      // Apply date range
      if (dateFrom) {
        query = query.where('dateOccurred', '>=', new Date(dateFrom));
      }
      if (dateTo) {
        query = query.where('dateOccurred', '<=', new Date(dateTo));
      }

      // Apply additional filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters?.severity) {
        query = query.where('severity', '==', filters.severity);
      }

      const snapshot = await query.get();
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateOccurred: doc.data().dateOccurred?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Generate report data
      const reportData = {
        title: 'Incident Report',
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        filters,
        summary: {
          totalIncidents: incidents.length,
          byStatus: {
            open: incidents.filter((i: any) => i.status === 'open').length,
            investigating: incidents.filter((i: any) => i.status === 'investigating').length,
            resolved: incidents.filter((i: any) => i.status === 'resolved').length,
            closed: incidents.filter((i: any) => i.status === 'closed').length
          },
          bySeverity: {
            low: incidents.filter((i: any) => i.severity === 'low').length,
            medium: incidents.filter((i: any) => i.severity === 'medium').length,
            high: incidents.filter((i: any) => i.severity === 'high').length,
            critical: incidents.filter((i: any) => i.severity === 'critical').length
          },
          byType: {
            accident: incidents.filter((i: any) => i.type === 'accident').length,
            near_miss: incidents.filter((i: any) => i.type === 'near_miss').length,
            hazard: incidents.filter((i: any) => i.type === 'hazard').length,
            property_damage: incidents.filter((i: any) => i.type === 'property_damage').length,
            environmental: incidents.filter((i: any) => i.type === 'environmental').length
          }
        },
        incidents: incidents
      };

      // Store report in database
      const reportRef = await db.collection('reports').add({
        type: 'incidents',
        title: reportData.title,
        generatedBy: req.user!.uid,
        tenantId: req.user!.tenantId,
        dateRange: reportData.dateRange,
        filters,
        summary: reportData.summary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        format
      });

      res.json({
        reportId: reportRef.id,
        ...reportData
      });
    } catch (error: any) {
      console.error('Generate incident report error:', error);
      res.status(500).json({
        error: 'Failed to generate incident report',
        code: 'GENERATE_INCIDENT_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

// Generate audit report
router.post('/audits',
  authenticateToken,
  requirePermission('reports.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { dateFrom, dateTo, filters, format = 'json' } = req.body;

      const db = admin.firestore();
      let query = db.collection('audits')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      // Apply date range
      if (dateFrom) {
        query = query.where('scheduledDate', '>=', new Date(dateFrom));
      }
      if (dateTo) {
        query = query.where('scheduledDate', '<=', new Date(dateTo));
      }

      // Apply additional filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.type) {
        query = query.where('type', '==', filters.type);
      }

      const snapshot = await query.get();
      const audits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Calculate compliance metrics
      const completedAudits = audits.filter((a: any) => a.status === 'completed');
      const totalScore = completedAudits.reduce((sum: number, audit: any) => sum + (audit.score || 0), 0);
      const averageScore = completedAudits.length > 0 ? totalScore / completedAudits.length : 0;

      const reportData = {
        title: 'Audit Report',
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        filters,
        summary: {
          totalAudits: audits.length,
          completedAudits: completedAudits.length,
          averageScore: Math.round(averageScore * 100) / 100,
          byStatus: {
            scheduled: audits.filter((a: any) => a.status === 'scheduled').length,
            in_progress: audits.filter((a: any) => a.status === 'in_progress').length,
            completed: audits.filter((a: any) => a.status === 'completed').length,
            cancelled: audits.filter((a: any) => a.status === 'cancelled').length
          },
          byType: {
            internal: audits.filter((a: any) => a.type === 'internal').length,
            external: audits.filter((a: any) => a.type === 'external').length,
            compliance: audits.filter((a: any) => a.type === 'compliance').length,
            safety: audits.filter((a: any) => a.type === 'safety').length,
            environmental: audits.filter((a: any) => a.type === 'environmental').length
          }
        },
        audits: audits
      };

      // Store report in database
      const reportRef = await db.collection('reports').add({
        type: 'audits',
        title: reportData.title,
        generatedBy: req.user!.uid,
        tenantId: req.user!.tenantId,
        dateRange: reportData.dateRange,
        filters,
        summary: reportData.summary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        format
      });

      res.json({
        reportId: reportRef.id,
        ...reportData
      });
    } catch (error: any) {
      console.error('Generate audit report error:', error);
      res.status(500).json({
        error: 'Failed to generate audit report',
        code: 'GENERATE_AUDIT_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

// Generate corrective actions report
router.post('/corrective-actions',
  authenticateToken,
  requirePermission('reports.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { dateFrom, dateTo, filters, format = 'json' } = req.body;

      const db = admin.firestore();
      let query = db.collection('correctiveActions')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      // Apply date range
      if (dateFrom) {
        query = query.where('createdAt', '>=', new Date(dateFrom));
      }
      if (dateTo) {
        query = query.where('createdAt', '<=', new Date(dateTo));
      }

      // Apply additional filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.priority) {
        query = query.where('priority', '==', filters.priority);
      }
      if (filters?.type) {
        query = query.where('type', '==', filters.type);
      }

      const snapshot = await query.get();
      const actions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate()
      }));

      // Calculate metrics
      const completedActions = actions.filter((a: any) => a.status === 'completed');
      const overdueActions = actions.filter((a: any) => {
        const dueDate = a.dueDate;
        return dueDate && dueDate < new Date() && a.status !== 'completed';
      });

      const reportData = {
        title: 'Corrective Actions Report',
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        filters,
        summary: {
          totalActions: actions.length,
          completedActions: completedActions.length,
          overdueActions: overdueActions.length,
          completionRate: actions.length > 0 ? Math.round((completedActions.length / actions.length) * 100) : 0,
          byStatus: {
            open: actions.filter((a: any) => a.status === 'open').length,
            in_progress: actions.filter((a: any) => a.status === 'in_progress').length,
            completed: actions.filter((a: any) => a.status === 'completed').length,
            cancelled: actions.filter((a: any) => a.status === 'cancelled').length
          },
          byPriority: {
            low: actions.filter((a: any) => a.priority === 'low').length,
            medium: actions.filter((a: any) => a.priority === 'medium').length,
            high: actions.filter((a: any) => a.priority === 'high').length,
            critical: actions.filter((a: any) => a.priority === 'critical').length
          },
          byType: {
            corrective: actions.filter((a: any) => a.type === 'corrective').length,
            preventive: actions.filter((a: any) => a.type === 'preventive').length,
            improvement: actions.filter((a: any) => a.type === 'improvement').length
          }
        },
        actions: actions
      };

      // Store report in database
      const reportRef = await db.collection('reports').add({
        type: 'corrective_actions',
        title: reportData.title,
        generatedBy: req.user!.uid,
        tenantId: req.user!.tenantId,
        dateRange: reportData.dateRange,
        filters,
        summary: reportData.summary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        format
      });

      res.json({
        reportId: reportRef.id,
        ...reportData
      });
    } catch (error: any) {
      console.error('Generate corrective actions report error:', error);
      res.status(500).json({
        error: 'Failed to generate corrective actions report',
        code: 'GENERATE_CORRECTIVE_ACTIONS_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

// Generate compliance dashboard report
router.post('/compliance',
  authenticateToken,
  requirePermission('reports.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { dateFrom, dateTo } = req.body;

      const db = admin.firestore();
      const tenantId = req.user!.tenantId;

      // Get data from multiple collections
      const [incidentsSnapshot, auditsSnapshot, actionsSnapshot] = await Promise.all([
        db.collection('incidents').where('tenantId', '==', tenantId).where('isDeleted', '!=', true).get(),
        db.collection('audits').where('tenantId', '==', tenantId).where('isDeleted', '!=', true).get(),
        db.collection('correctiveActions').where('tenantId', '==', tenantId).where('isDeleted', '!=', true).get()
      ]);

      const incidents = incidentsSnapshot.docs.map(doc => doc.data());
      const audits = auditsSnapshot.docs.map(doc => doc.data());
      const actions = actionsSnapshot.docs.map(doc => doc.data());

      // Calculate compliance metrics
      const completedAudits = audits.filter(a => a.status === 'completed');
      const totalAuditScore = completedAudits.reduce((sum, audit) => sum + (audit.score || 0), 0);
      const averageAuditScore = completedAudits.length > 0 ? totalAuditScore / completedAudits.length : 0;

      const completedActions = actions.filter(a => a.status === 'completed');
      const actionCompletionRate = actions.length > 0 ? (completedActions.length / actions.length) * 100 : 0;

      const criticalIncidents = incidents.filter(i => i.severity === 'critical');
      const openIncidents = incidents.filter(i => i.status === 'open');

      const reportData = {
        title: 'Compliance Dashboard Report',
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        complianceScore: Math.round(averageAuditScore * 100) / 100,
        metrics: {
          incidents: {
            total: incidents.length,
            critical: criticalIncidents.length,
            open: openIncidents.length,
            resolved: incidents.filter(i => i.status === 'resolved').length
          },
          audits: {
            total: audits.length,
            completed: completedAudits.length,
            averageScore: Math.round(averageAuditScore * 100) / 100,
            scheduled: audits.filter(a => a.status === 'scheduled').length
          },
          correctiveActions: {
            total: actions.length,
            completed: completedActions.length,
            completionRate: Math.round(actionCompletionRate),
            overdue: actions.filter(a => {
              const dueDate = a.dueDate?.toDate();
              return dueDate && dueDate < new Date() && a.status !== 'completed';
            }).length
          }
        },
        trends: {
          incidentTrend: 'stable', // This would be calculated based on historical data
          auditTrend: 'improving',
          actionTrend: 'improving'
        },
        recommendations: [
          'Continue focus on preventive measures',
          'Increase frequency of safety training',
          'Review and update safety procedures quarterly'
        ]
      };

      // Store report in database
      const reportRef = await db.collection('reports').add({
        type: 'compliance',
        title: reportData.title,
        generatedBy: req.user!.uid,
        tenantId: req.user!.tenantId,
        dateRange: reportData.dateRange,
        complianceScore: reportData.complianceScore,
        metrics: reportData.metrics,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        format: 'json'
      });

      res.json({
        reportId: reportRef.id,
        ...reportData
      });
    } catch (error: any) {
      console.error('Generate compliance report error:', error);
      res.status(500).json({
        error: 'Failed to generate compliance report',
        code: 'GENERATE_COMPLIANCE_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

// Get saved reports
router.get('/',
  authenticateToken,
  requirePermission('reports.read'),
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { page = 1, limit = 20, type } = req.query;

      const db = admin.firestore();
      let query = db.collection('reports')
        .where('tenantId', '==', req.user!.tenantId)
        .orderBy('createdAt', 'desc');

      if (type) {
        query = query.where('type', '==', type);
      }

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
      
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      res.json({
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: snapshot.docs.length === Number(limit)
        }
      });
    } catch (error: any) {
      console.error('Get reports error:', error);
      res.status(500).json({
        error: 'Failed to get reports',
        code: 'GET_REPORTS_FAILED',
        details: error.message
      });
    }
  }
);

// Get report by ID
router.get('/:id',
  authenticateToken,
  requirePermission('reports.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const reportDoc = await db.collection('reports').doc(id).get();
      
      if (!reportDoc.exists) {
        res.status(404).json({
          error: 'Report not found',
          code: 'REPORT_NOT_FOUND'
        });
        return;
      }

      const reportData = reportDoc.data()!;
      
      // Check tenant access
      if (reportData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      res.json({
        id: reportDoc.id,
        ...reportData,
        createdAt: reportData.createdAt?.toDate()
      });
    } catch (error: any) {
      console.error('Get report error:', error);
      res.status(500).json({
        error: 'Failed to get report',
        code: 'GET_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

// Delete report
router.delete('/:id',
  authenticateToken,
  requirePermission('reports.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const reportDoc = await db.collection('reports').doc(id).get();
      
      if (!reportDoc.exists) {
        res.status(404).json({
          error: 'Report not found',
          code: 'REPORT_NOT_FOUND'
        });
        return;
      }

      const reportData = reportDoc.data()!;
      
      // Check tenant access
      if (reportData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      await reportDoc.ref.delete();

      res.json({ message: 'Report deleted successfully' });
    } catch (error: any) {
      console.error('Delete report error:', error);
      res.status(500).json({
        error: 'Failed to delete report',
        code: 'DELETE_REPORT_FAILED',
        details: error.message
      });
    }
  }
);

export { router as reportRoutes };

