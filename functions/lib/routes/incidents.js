"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.incidentRoutes = router;
// Get all incidents with filtering and pagination
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, severity, dateFrom, dateTo } = req.query;
        const db = admin.firestore();
        let query = db.collection('incidents')
            .where('tenantId', '==', req.user.tenantId);
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
            query = query.where('dateOccurred', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            query = query.where('dateOccurred', '<=', new Date(dateTo));
        }
        // Apply sorting
        query = query.orderBy(sortBy, sortOrder);
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
            .where('tenantId', '==', req.user.tenantId);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        const incidents = snapshot.docs.map(doc => {
            var _a, _b, _c;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), dateOccurred: (_c = doc.data().dateOccurred) === null || _c === void 0 ? void 0 : _c.toDate() }));
        });
        // Apply text search if provided
        let filteredIncidents = incidents;
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredIncidents = incidents.filter((incident) => incident.title.toLowerCase().includes(searchTerm) ||
                incident.description.toLowerCase().includes(searchTerm) ||
                incident.location.toLowerCase().includes(searchTerm));
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
    }
    catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({
            error: 'Failed to get incidents',
            code: 'GET_INCIDENTS_FAILED',
            details: error.message
        });
    }
});
// Get incident by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b, _c;
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
        const incidentData = incidentDoc.data();
        // Check tenant access
        if (incidentData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        res.json(Object.assign(Object.assign({ id: incidentDoc.id }, incidentData), { createdAt: (_a = incidentData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = incidentData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), dateOccurred: (_c = incidentData.dateOccurred) === null || _c === void 0 ? void 0 : _c.toDate() }));
    }
    catch (error) {
        console.error('Get incident error:', error);
        res.status(500).json({
            error: 'Failed to get incident',
            code: 'GET_INCIDENT_FAILED',
            details: error.message
        });
    }
});
// Create new incident
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.create'), (0, validation_1.validateRequest)(validation_1.schemas.incident), async (req, res) => {
    try {
        const incidentData = Object.assign(Object.assign({}, req.body), { tenantId: req.user.tenantId, reportedBy: req.user.uid, status: 'open', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), dateOccurred: new Date(req.body.dateOccurred), incidentNumber: await generateIncidentNumber(req.user.tenantId) });
        const db = admin.firestore();
        const incidentRef = await db.collection('incidents').add(incidentData);
        // Create initial activity log entry
        await db.collection('activityLogs').add({
            entityType: 'incident',
            entityId: incidentRef.id,
            action: 'created',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
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
    }
    catch (error) {
        console.error('Create incident error:', error);
        res.status(500).json({
            error: 'Failed to create incident',
            code: 'CREATE_INCIDENT_FAILED',
            details: error.message
        });
    }
});
// Update incident
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
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
        const existingData = incidentDoc.data();
        // Check tenant access
        if (existingData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastModifiedBy: req.user.uid });
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
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                changes: Object.keys(req.body),
                previousStatus: existingData.status,
                newStatus: req.body.status || existingData.status
            }
        });
        res.json({ message: 'Incident updated successfully' });
    }
    catch (error) {
        console.error('Update incident error:', error);
        res.status(500).json({
            error: 'Failed to update incident',
            code: 'UPDATE_INCIDENT_FAILED',
            details: error.message
        });
    }
});
// Delete incident
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
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
        const incidentData = incidentDoc.data();
        // Check tenant access
        if (incidentData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
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
            deletedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'incident',
            entityId: id,
            action: 'deleted',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: incidentData.title,
                type: incidentData.type
            }
        });
        res.json({ message: 'Incident deleted successfully' });
    }
    catch (error) {
        console.error('Delete incident error:', error);
        res.status(500).json({
            error: 'Failed to delete incident',
            code: 'DELETE_INCIDENT_FAILED',
            details: error.message
        });
    }
});
// Get incident statistics
router.get('/stats/overview', auth_1.authenticateToken, (0, auth_1.requirePermission)('incidents.read'), async (req, res) => {
    try {
        const db = admin.firestore();
        const incidentsRef = db.collection('incidents')
            .where('tenantId', '==', req.user.tenantId)
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
                var _a;
                const incidentDate = (_a = i.dateOccurred) === null || _a === void 0 ? void 0 : _a.toDate();
                const now = new Date();
                return incidentDate &&
                    incidentDate.getMonth() === now.getMonth() &&
                    incidentDate.getFullYear() === now.getFullYear();
            }).length,
            lastMonth: incidents.filter(i => {
                var _a;
                const incidentDate = (_a = i.dateOccurred) === null || _a === void 0 ? void 0 : _a.toDate();
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return incidentDate &&
                    incidentDate.getMonth() === lastMonth.getMonth() &&
                    incidentDate.getFullYear() === lastMonth.getFullYear();
            }).length
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Get incident stats error:', error);
        res.status(500).json({
            error: 'Failed to get incident statistics',
            code: 'GET_INCIDENT_STATS_FAILED',
            details: error.message
        });
    }
});
// Helper function to generate incident number
async function generateIncidentNumber(tenantId) {
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
//# sourceMappingURL=incidents.js.map