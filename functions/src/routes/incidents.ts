import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Get all incidents with filtering and pagination
router.get('/', 
  authenticateToken, 
  requirePermission('incidents.read'),
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
        severity,
        dateFrom,
        dateTo
      } = req.query;

      const db = admin.firestore();
      let query = db.collection('incidents')
        .where('tenantId', '==', req.user!.tenantId);

      // Apply filters
      if (status) {
        query = query.where('status', '==', status);
      }
      if (type) {
        query = query.where('type', '==', type);
      }
      if (severity) {
        query = query.where('severity', '==', severity);
      }
      if (dateFrom) {
        query = query.where('dateOccurred', '>=', new Date(dateFrom as string));
      }
      if (dateTo) {
        query = query.where('dateOccurred', '<=', new Date(dateTo as string));
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
      
      // Get total count for pagination
      const totalQuery = db.collection('incidents')
        .where('tenantId', '==', req.user!.tenantId);
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dateOccurred: doc.data().dateOccurred?.toDate()
      }));

      // Apply text search if provided
      let filteredIncidents = incidents;
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredIncidents = incidents.filter((incident: any) =>
          incident.title.toLowerCase().includes(searchTerm) ||
          incident.description.toLowerCase().includes(searchTerm) ||
          incident.location.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        incidents: filteredIncidents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get incidents error:', error);
      res.status(500).json({
        error: 'Failed to get incidents',
        code: 'GET_INCIDENTS_FAILED',
        details: error.message
      });
    }
  }
);

// Get incident by ID
router.get('/:id',
  authenticateToken,
  requirePermission('incidents.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const incidentDoc = await db.collection('incidents').doc(id).get();
      
      if (!incidentDoc.exists) {
        res.status(404).json({
          error: 'Incident not found',
          code: 'INCIDENT_NOT_FOUND'
        });
        return;
      }

      const incidentData = incidentDoc.data()!;
      
      // Check tenant access
      if (incidentData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      res.json({
        id: incidentDoc.id,
        ...incidentData,
        createdAt: incidentData.createdAt?.toDate(),
        updatedAt: incidentData.updatedAt?.toDate(),
        dateOccurred: incidentData.dateOccurred?.toDate()
      });
    } catch (error: any) {
      console.error('Get incident error:', error);
      res.status(500).json({
        error: 'Failed to get incident',
        code: 'GET_INCIDENT_FAILED',
        details: error.message
      });
    }
  }
);

// Create new incident
router.post('/',
  authenticateToken,
  requirePermission('incidents.create'),
  validateRequest(schemas.incident),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const incidentData = {
        ...req.body,
        tenantId: req.user!.tenantId,
        reportedBy: req.user!.uid,
        status: 'open',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dateOccurred: new Date(req.body.dateOccurred),
        incidentNumber: await generateIncidentNumber(req.user!.tenantId)
      };

      const db = admin.firestore();
      const incidentRef = await db.collection('incidents').add(incidentData);

      // Create initial activity log entry
      await db.collection('activityLogs').add({
        entityType: 'incident',
        entityId: incidentRef.id,
        action: 'created',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title: incidentData.title,
          type: incidentData.type,
          severity: incidentData.severity
        }
      });

      res.status(201).json({
        id: incidentRef.id,
        message: 'Incident created successfully'
      });
    } catch (error: any) {
      console.error('Create incident error:', error);
      res.status(500).json({
        error: 'Failed to create incident',
        code: 'CREATE_INCIDENT_FAILED',
        details: error.message
      });
    }
  }
);

// Update incident
router.put('/:id',
  authenticateToken,
  requirePermission('incidents.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const incidentDoc = await db.collection('incidents').doc(id).get();
      
      if (!incidentDoc.exists) {
        res.status(404).json({
          error: 'Incident not found',
          code: 'INCIDENT_NOT_FOUND'
        });
        return;
      }

      const existingData = incidentDoc.data()!;
      
      // Check tenant access
      if (existingData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const updateData = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.user!.uid
      };

      // Convert date fields
      if (req.body.dateOccurred) {
        updateData.dateOccurred = new Date(req.body.dateOccurred);
      }

      await incidentDoc.ref.update(updateData);

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'incident',
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

      res.json({ message: 'Incident updated successfully' });
    } catch (error: any) {
      console.error('Update incident error:', error);
      res.status(500).json({
        error: 'Failed to update incident',
        code: 'UPDATE_INCIDENT_FAILED',
        details: error.message
      });
    }
  }
);

// Delete incident
router.delete('/:id',
  authenticateToken,
  requirePermission('incidents.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      
      const incidentDoc = await db.collection('incidents').doc(id).get();
      
      if (!incidentDoc.exists) {
        res.status(404).json({
          error: 'Incident not found',
          code: 'INCIDENT_NOT_FOUND'
        });
        return;
      }

      const incidentData = incidentDoc.data()!;
      
      // Check tenant access
      if (incidentData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Soft delete - mark as deleted instead of actually deleting
      await incidentDoc.ref.update({
        isDeleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: req.user!.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'incident',
        entityId: id,
        action: 'deleted',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title: incidentData.title,
          type: incidentData.type
        }
      });

      res.json({ message: 'Incident deleted successfully' });
    } catch (error: any) {
      console.error('Delete incident error:', error);
      res.status(500).json({
        error: 'Failed to delete incident',
        code: 'DELETE_INCIDENT_FAILED',
        details: error.message
      });
    }
  }
);

// Get incident statistics
router.get('/stats/overview',
  authenticateToken,
  requirePermission('incidents.read'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const db = admin.firestore();
      const incidentsRef = db.collection('incidents')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);

      // Get all incidents for statistics
      const snapshot = await incidentsRef.get();
      const incidents = snapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const stats = {
        total: incidents.length,
        byStatus: {
          open: incidents.filter(i => i.status === 'open').length,
          investigating: incidents.filter(i => i.status === 'investigating').length,
          resolved: incidents.filter(i => i.status === 'resolved').length,
          closed: incidents.filter(i => i.status === 'closed').length
        },
        bySeverity: {
          low: incidents.filter(i => i.severity === 'low').length,
          medium: incidents.filter(i => i.severity === 'medium').length,
          high: incidents.filter(i => i.severity === 'high').length,
          critical: incidents.filter(i => i.severity === 'critical').length
        },
        byType: {
          accident: incidents.filter(i => i.type === 'accident').length,
          near_miss: incidents.filter(i => i.type === 'near_miss').length,
          hazard: incidents.filter(i => i.type === 'hazard').length,
          property_damage: incidents.filter(i => i.type === 'property_damage').length,
          environmental: incidents.filter(i => i.type === 'environmental').length
        },
        thisMonth: incidents.filter(i => {
          const incidentDate = i.dateOccurred?.toDate();
          const now = new Date();
          return incidentDate && 
            incidentDate.getMonth() === now.getMonth() && 
            incidentDate.getFullYear() === now.getFullYear();
        }).length,
        lastMonth: incidents.filter(i => {
          const incidentDate = i.dateOccurred?.toDate();
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return incidentDate && 
            incidentDate.getMonth() === lastMonth.getMonth() && 
            incidentDate.getFullYear() === lastMonth.getFullYear();
        }).length
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Get incident stats error:', error);
      res.status(500).json({
        error: 'Failed to get incident statistics',
        code: 'GET_INCIDENT_STATS_FAILED',
        details: error.message
      });
    }
  }
);

// Helper function to generate incident number
async function generateIncidentNumber(tenantId: string): Promise<string> {
  const db = admin.firestore();
  const year = new Date().getFullYear();
  const prefix = `INC-${year}`;
  
  // Get the last incident number for this year
  const lastIncidentQuery = await db.collection('incidents')
    .where('tenantId', '==', tenantId)
    .where('incidentNumber', '>=', prefix)
    .where('incidentNumber', '<', `INC-${year + 1}`)
    .orderBy('incidentNumber', 'desc')
    .limit(1)
    .get();

  let nextNumber = 1;
  if (!lastIncidentQuery.empty) {
    const lastIncidentNumber = lastIncidentQuery.docs[0].data().incidentNumber;
    const lastNumber = parseInt(lastIncidentNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
}

export { router as incidentRoutes };

