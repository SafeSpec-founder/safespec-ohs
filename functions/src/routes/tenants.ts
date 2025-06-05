import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Get all tenants (admin only)
router.get('/',
  authenticateToken,
  requirePermission('tenants.read'),
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      // Only super admins can view all tenants
      if (req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const { page = 1, limit = 20, search } = req.query;

      const db = admin.firestore();
      let query = db.collection('tenants').orderBy('createdAt', 'desc');

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
      
      let tenants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      // Apply text search if provided
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        tenants = tenants.filter((tenant: any) =>
          tenant.name.toLowerCase().includes(searchTerm) ||
          tenant.domain?.toLowerCase().includes(searchTerm) ||
          tenant.industry?.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        tenants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: snapshot.docs.length === Number(limit)
        }
      });
    } catch (error: any) {
      console.error('Get tenants error:', error);
      res.status(500).json({
        error: 'Failed to get tenants',
        code: 'GET_TENANTS_FAILED',
        details: error.message
      });
    }
  }
);

// Get current tenant
router.get('/current',
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const db = admin.firestore();
      const tenantDoc = await db.collection('tenants').doc(req.user!.tenantId).get();
      
      if (!tenantDoc.exists) {
        res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
        return;
      }

      const tenantData = tenantDoc.data()!;
      
      res.json({
        id: tenantDoc.id,
        ...tenantData,
        createdAt: tenantData.createdAt?.toDate(),
        updatedAt: tenantData.updatedAt?.toDate()
      });
    } catch (error: any) {
      console.error('Get current tenant error:', error);
      res.status(500).json({
        error: 'Failed to get current tenant',
        code: 'GET_CURRENT_TENANT_FAILED',
        details: error.message
      });
    }
  }
);

// Get tenant by ID
router.get('/:id',
  authenticateToken,
  requirePermission('tenants.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Users can only view their own tenant unless they're super admin
      if (id !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const db = admin.firestore();
      const tenantDoc = await db.collection('tenants').doc(id).get();
      
      if (!tenantDoc.exists) {
        res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
        return;
      }

      const tenantData = tenantDoc.data()!;
      
      res.json({
        id: tenantDoc.id,
        ...tenantData,
        createdAt: tenantData.createdAt?.toDate(),
        updatedAt: tenantData.updatedAt?.toDate()
      });
    } catch (error: any) {
      console.error('Get tenant error:', error);
      res.status(500).json({
        error: 'Failed to get tenant',
        code: 'GET_TENANT_FAILED',
        details: error.message
      });
    }
  }
);

// Create new tenant (super admin only)
router.post('/',
  authenticateToken,
  requirePermission('tenants.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      // Only super admins can create tenants
      if (req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const db = admin.firestore();
      
      // Check if tenant with same domain already exists
      if (req.body.domain) {
        const existingTenant = await db.collection('tenants')
          .where('domain', '==', req.body.domain)
          .get();
        
        if (!existingTenant.empty) {
          res.status(400).json({
            error: 'Tenant with this domain already exists',
            code: 'TENANT_DOMAIN_EXISTS'
          });
          return;
        }
      }

      const tenantData = {
        ...req.body,
        createdBy: req.user!.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        settings: {
          timezone: req.body.timezone || 'UTC',
          dateFormat: req.body.dateFormat || 'MM/DD/YYYY',
          currency: req.body.currency || 'USD',
          language: req.body.language || 'en',
          ...req.body.settings
        },
        subscription: {
          plan: req.body.plan || 'basic',
          status: 'active',
          startDate: admin.firestore.FieldValue.serverTimestamp(),
          ...req.body.subscription
        }
      };

      const tenantRef = await db.collection('tenants').add(tenantData);

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'tenant',
        entityId: tenantRef.id,
        action: 'created',
        userId: req.user!.uid,
        tenantId: tenantRef.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          name: tenantData.name,
          domain: tenantData.domain,
          plan: tenantData.subscription.plan
        }
      });

      res.status(201).json({
        id: tenantRef.id,
        message: 'Tenant created successfully'
      });
    } catch (error: any) {
      console.error('Create tenant error:', error);
      res.status(500).json({
        error: 'Failed to create tenant',
        code: 'CREATE_TENANT_FAILED',
        details: error.message
      });
    }
  }
);

// Update tenant
router.put('/:id',
  authenticateToken,
  requirePermission('tenants.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Users can only update their own tenant unless they're super admin
      if (id !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const db = admin.firestore();
      const tenantDoc = await db.collection('tenants').doc(id).get();
      
      if (!tenantDoc.exists) {
        res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
        return;
      }

      // Check if domain is being changed and if it conflicts
      if (req.body.domain) {
        const existingTenant = await db.collection('tenants')
          .where('domain', '==', req.body.domain)
          .get();
        
        if (!existingTenant.empty && existingTenant.docs[0].id !== id) {
          res.status(400).json({
            error: 'Tenant with this domain already exists',
            code: 'TENANT_DOMAIN_EXISTS'
          });
          return;
        }
      }

      const updateData = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.user!.uid
      };

      // Merge settings if provided
      if (req.body.settings) {
        const existingData = tenantDoc.data()!;
        updateData.settings = {
          ...existingData.settings,
          ...req.body.settings
        };
      }

      await tenantDoc.ref.update(updateData);

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'tenant',
        entityId: id,
        action: 'updated',
        userId: req.user!.uid,
        tenantId: id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          changes: Object.keys(req.body)
        }
      });

      res.json({ message: 'Tenant updated successfully' });
    } catch (error: any) {
      console.error('Update tenant error:', error);
      res.status(500).json({
        error: 'Failed to update tenant',
        code: 'UPDATE_TENANT_FAILED',
        details: error.message
      });
    }
  }
);

// Deactivate tenant (super admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('tenants.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Only super admins can deactivate tenants
      if (req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const db = admin.firestore();
      const tenantDoc = await db.collection('tenants').doc(id).get();
      
      if (!tenantDoc.exists) {
        res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
        return;
      }

      // Soft delete - deactivate instead of deleting
      await tenantDoc.ref.update({
        isActive: false,
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deactivatedBy: req.user!.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Deactivate all users in this tenant
      const usersQuery = await db.collection('users')
        .where('tenantId', '==', id)
        .get();

      const batch = db.batch();
      usersQuery.docs.forEach(userDoc => {
        batch.update(userDoc.ref, {
          isActive: false,
          deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'tenant',
        entityId: id,
        action: 'deactivated',
        userId: req.user!.uid,
        tenantId: id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          usersDeactivated: usersQuery.docs.length
        }
      });

      res.json({ 
        message: 'Tenant deactivated successfully',
        usersDeactivated: usersQuery.docs.length
      });
    } catch (error: any) {
      console.error('Deactivate tenant error:', error);
      res.status(500).json({
        error: 'Failed to deactivate tenant',
        code: 'DEACTIVATE_TENANT_FAILED',
        details: error.message
      });
    }
  }
);

// Get tenant statistics
router.get('/:id/stats',
  authenticateToken,
  requirePermission('tenants.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Users can only view their own tenant stats unless they're super admin
      if (id !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const db = admin.firestore();
      
      // Get counts from various collections
      const [usersSnapshot, incidentsSnapshot, auditsSnapshot, actionsSnapshot] = await Promise.all([
        db.collection('users').where('tenantId', '==', id).get(),
        db.collection('incidents').where('tenantId', '==', id).where('isDeleted', '!=', true).get(),
        db.collection('audits').where('tenantId', '==', id).where('isDeleted', '!=', true).get(),
        db.collection('correctiveActions').where('tenantId', '==', id).where('isDeleted', '!=', true).get()
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const incidents = incidentsSnapshot.docs.map(doc => doc.data());
      const audits = auditsSnapshot.docs.map(doc => doc.data());
      const actions = actionsSnapshot.docs.map(doc => doc.data());

      const stats = {
        users: {
          total: users.length,
          active: users.filter(u => u.isActive).length,
          byRole: {
            admin: users.filter(u => u.role === 'admin').length,
            safety_manager: users.filter(u => u.role === 'safety_manager').length,
            supervisor: users.filter(u => u.role === 'supervisor').length,
            employee: users.filter(u => u.role === 'employee').length,
            auditor: users.filter(u => u.role === 'auditor').length,
            contractor: users.filter(u => u.role === 'contractor').length
          }
        },
        incidents: {
          total: incidents.length,
          open: incidents.filter(i => i.status === 'open').length,
          critical: incidents.filter(i => i.severity === 'critical').length,
          thisMonth: incidents.filter(i => {
            const incidentDate = i.dateOccurred?.toDate();
            const now = new Date();
            return incidentDate && 
              incidentDate.getMonth() === now.getMonth() && 
              incidentDate.getFullYear() === now.getFullYear();
          }).length
        },
        audits: {
          total: audits.length,
          completed: audits.filter(a => a.status === 'completed').length,
          scheduled: audits.filter(a => a.status === 'scheduled').length,
          averageScore: audits.filter(a => a.score).reduce((sum, audit) => sum + audit.score, 0) / audits.filter(a => a.score).length || 0
        },
        correctiveActions: {
          total: actions.length,
          completed: actions.filter(a => a.status === 'completed').length,
          overdue: actions.filter(a => {
            const dueDate = a.dueDate?.toDate();
            return dueDate && dueDate < new Date() && a.status !== 'completed';
          }).length
        }
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Get tenant stats error:', error);
      res.status(500).json({
        error: 'Failed to get tenant statistics',
        code: 'GET_TENANT_STATS_FAILED',
        details: error.message
      });
    }
  }
);

export { router as tenantRoutes };

