import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Get all audits with filtering and pagination
router.get('/',
  authenticateToken,
  requirePermission('audits.read'),
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        status,
        type,
        dateFrom,
        dateTo
      } = req.query;

      const db = admin.firestore();
      let query = db.collection('audits')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      // Apply filters
      if (status) {
        query = query.where('status', '==', status);
      }
      if (type) {
        query = query.where('type', '==', type);
      }
      if (dateFrom) {
        query = query.where('scheduledDate', '>=', new Date(dateFrom as string));
      }
      if (dateTo) {
        query = query.where('scheduledDate', '<=', new Date(dateTo as string));
      }

      // Apply sorting
      query = query.orderBy(sortBy as string, sortOrder as 'asc' | 'desc');

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
      
      // Get total count
      const totalQuery = db.collection('audits')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      const audits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate()
      }));

      // Apply text search if provided
      let filteredAudits = audits;
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredAudits = audits.filter((audit: any) =>
          audit.title.toLowerCase().includes(searchTerm) ||
          audit.description?.toLowerCase().includes(searchTerm) ||
          audit.scope.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        audits: filteredAudits,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get audits error:', error);
      res.status(500).json({
        error: 'Failed to get audits',
        code: 'GET_AUDITS_FAILED',
        details: error.message
      });
    }
  }
);

// Get audit by ID
router.get('/:id',
  authenticateToken,
  requirePermission('audits.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const auditDoc = await db.collection('audits').doc(id).get();
      
      if (!auditDoc.exists) {
        res.status(404).json({
          error: 'Audit not found',
          code: 'AUDIT_NOT_FOUND'
        });
        return;
      }

      const auditData = auditDoc.data()!;
      
      // Check tenant access
      if (auditData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      res.json({
        id: auditDoc.id,
        ...auditData,
        createdAt: auditData.createdAt?.toDate(),
        updatedAt: auditData.updatedAt?.toDate(),
        scheduledDate: auditData.scheduledDate?.toDate(),
        completedDate: auditData.completedDate?.toDate()
      });
    } catch (error: any) {
      console.error('Get audit error:', error);
      res.status(500).json({
        error: 'Failed to get audit',
        code: 'GET_AUDIT_FAILED',
        details: error.message
      });
    }
  }
);

// Create new audit
router.post('/',
  authenticateToken,
  requirePermission('audits.create'),
  validateRequest(schemas.audit),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const auditData = {
        ...req.body,
        tenantId: req.user!.tenantId,
        createdBy: req.user!.uid,
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        scheduledDate: new Date(req.body.scheduledDate),
        auditNumber: await generateAuditNumber(req.user!.tenantId),
        isDeleted: false,
        findings: [],
        score: null,
        completedDate: null
      };

      const db = admin.firestore();
      const auditRef = await db.collection('audits').add(auditData);

      // Create notifications for assigned auditors
      const notifications = req.body.assignedAuditors.map((auditorId: string) => ({
        userId: auditorId,
        type: 'audit_assigned',
        title: 'New Audit Assignment',
        message: `You have been assigned to audit: ${auditData.title}`,
        data: {
          auditId: auditRef.id,
          scheduledDate: auditData.scheduledDate
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        tenantId: req.user!.tenantId
      }));

      // Batch write notifications
      const batch = db.batch();
      notifications.forEach((notification: any) => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });
      await batch.commit();

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'audit',
        entityId: auditRef.id,
        action: 'created',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title: auditData.title,
          type: auditData.type,
          assignedAuditors: req.body.assignedAuditors
        }
      });

      res.status(201).json({
        id: auditRef.id,
        message: 'Audit created successfully'
      });
    } catch (error: any) {
      console.error('Create audit error:', error);
      res.status(500).json({
        error: 'Failed to create audit',
        code: 'CREATE_AUDIT_FAILED',
        details: error.message
      });
    }
  }
);

// Update audit
router.put('/:id',
  authenticateToken,
  requirePermission('audits.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const auditDoc = await db.collection('audits').doc(id).get();
      
      if (!auditDoc.exists) {
        res.status(404).json({
          error: 'Audit not found',
          code: 'AUDIT_NOT_FOUND'
        });
        return;
      }

      const existingData = auditDoc.data()!;
      
      // Check tenant access
      if (existingData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const updateData: any = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.user!.uid
      };

      // Convert date fields
      if (req.body.scheduledDate) {
        updateData.scheduledDate = new Date(req.body.scheduledDate);
      }
      if (req.body.completedDate) {
        updateData.completedDate = new Date(req.body.completedDate);
      }

      // If status is being changed to completed, set completion date
      if (req.body.status === 'completed' && existingData.status !== 'completed') {
        updateData.completedDate = admin.firestore.FieldValue.serverTimestamp();
      }

      await auditDoc.ref.update(updateData);

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'audit',
        entityId: id,
        action: 'updated',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          changes: Object.keys(req.body),
          previousStatus: existingData.status,
          newStatus: req.body.status || existingData.status
        }
      });

      res.json({ message: 'Audit updated successfully' });
    } catch (error: any) {
      console.error('Update audit error:', error);
      res.status(500).json({
        error: 'Failed to update audit',
        code: 'UPDATE_AUDIT_FAILED',
        details: error.message
      });
    }
  }
);

// Submit audit findings
router.post('/:id/findings',
  authenticateToken,
  requirePermission('audits.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { findings, score, notes } = req.body;

      if (!findings || !Array.isArray(findings)) {
        res.status(400).json({
          error: 'Findings array is required',
          code: 'FINDINGS_REQUIRED'
        });
        return;
      }

      const db = admin.firestore();
      const auditDoc = await db.collection('audits').doc(id).get();
      
      if (!auditDoc.exists) {
        res.status(404).json({
          error: 'Audit not found',
          code: 'AUDIT_NOT_FOUND'
        });
        return;
      }

      const auditData = auditDoc.data()!;
      
      // Check tenant access
      if (auditData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Check if user is assigned to this audit
      if (!auditData.assignedAuditors.includes(req.user!.uid) && req.user!.role !== 'admin') {
        res.status(403).json({
          error: 'Not assigned to this audit',
          code: 'NOT_ASSIGNED'
        });
        return;
      }

      // Update audit with findings
      await auditDoc.ref.update({
        findings,
        score,
        notes,
        status: 'completed',
        completedDate: admin.firestore.FieldValue.serverTimestamp(),
        completedBy: req.user!.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create corrective actions for non-conformities
      const nonConformities = findings.filter((finding: any) => 
        finding.status === 'non_conformity' || finding.status === 'major_non_conformity'
      );

      const batch = db.batch();
      
      for (const finding of nonConformities) {
        const correctiveActionRef = db.collection('correctiveActions').doc();
        batch.set(correctiveActionRef, {
          title: `Corrective Action for: ${finding.question}`,
          description: finding.notes || finding.question,
          type: 'corrective',
          priority: finding.status === 'major_non_conformity' ? 'high' : 'medium',
          status: 'open',
          relatedAuditId: id,
          relatedFindingId: finding.id,
          tenantId: req.user!.tenantId,
          createdBy: req.user!.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          assignedTo: auditData.createdBy // Assign to audit creator initially
        });
      }

      await batch.commit();

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'audit',
        entityId: id,
        action: 'findings_submitted',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          findingsCount: findings.length,
          nonConformitiesCount: nonConformities.length,
          score
        }
      });

      res.json({
        message: 'Audit findings submitted successfully',
        correctiveActionsCreated: nonConformities.length
      });
    } catch (error: any) {
      console.error('Submit audit findings error:', error);
      res.status(500).json({
        error: 'Failed to submit audit findings',
        code: 'SUBMIT_FINDINGS_FAILED',
        details: error.message
      });
    }
  }
);

// Delete audit
router.delete('/:id',
  authenticateToken,
  requirePermission('audits.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const auditDoc = await db.collection('audits').doc(id).get();
      
      if (!auditDoc.exists) {
        res.status(404).json({
          error: 'Audit not found',
          code: 'AUDIT_NOT_FOUND'
        });
        return;
      }

      const auditData = auditDoc.data()!;
      
      // Check tenant access
      if (auditData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Soft delete
      await auditDoc.ref.update({
        isDeleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: req.user!.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'audit',
        entityId: id,
        action: 'deleted',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title: auditData.title,
          type: auditData.type
        }
      });

      res.json({ message: 'Audit deleted successfully' });
    } catch (error: any) {
      console.error('Delete audit error:', error);
      res.status(500).json({
        error: 'Failed to delete audit',
        code: 'DELETE_AUDIT_FAILED',
        details: error.message
      });
    }
  }
);

// Get audit statistics
router.get('/stats/overview',
  authenticateToken,
  requirePermission('audits.read'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const db = admin.firestore();
      const auditsRef = db.collection('audits')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      const snapshot = await auditsRef.get();
      const audits = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: audits.length,
        byStatus: {
          scheduled: audits.filter(a => a.status === 'scheduled').length,
          in_progress: audits.filter(a => a.status === 'in_progress').length,
          completed: audits.filter(a => a.status === 'completed').length,
          cancelled: audits.filter(a => a.status === 'cancelled').length
        },
        byType: {
          internal: audits.filter(a => a.type === 'internal').length,
          external: audits.filter(a => a.type === 'external').length,
          compliance: audits.filter(a => a.type === 'compliance').length,
          safety: audits.filter(a => a.type === 'safety').length,
          environmental: audits.filter(a => a.type === 'environmental').length
        },
        thisMonth: audits.filter(a => {
          const auditDate = a.scheduledDate?.toDate();
          const now = new Date();
          return auditDate && 
            auditDate.getMonth() === now.getMonth() && 
            auditDate.getFullYear() === now.getFullYear();
        }).length,
        lastMonth: audits.filter(a => {
          const auditDate = a.scheduledDate?.toDate();
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return auditDate && 
            auditDate.getMonth() === lastMonth.getMonth() && 
            auditDate.getFullYear() === lastMonth.getFullYear();
        }).length
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Get audit stats error:', error);
      res.status(500).json({
        error: 'Failed to get audit statistics',
        code: 'GET_AUDIT_STATS_FAILED',
        details: error.message
      });
    }
  }
);

// Helper function to generate audit number
async function generateAuditNumber(tenantId: string): Promise<string> {
  const db = admin.firestore();
  const year = new Date().getFullYear();
  const prefix = `AUD-${year}`;
  
  // Get the last audit number for this year
  const lastAuditQuery = await db.collection('audits')
    .where('tenantId', '==', tenantId)
    .where('auditNumber', '>=', prefix)
    .where('auditNumber', '<', `AUD-${year + 1}`)
    .orderBy('auditNumber', 'desc')
    .limit(1)
    .get();

  let nextNumber = 1;
  if (!lastAuditQuery.empty) {
    const lastAuditNumber = lastAuditQuery.docs[0].data().auditNumber;
    const lastNumber = parseInt(lastAuditNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
}

export { router as auditRoutes };

