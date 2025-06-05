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
exports.auditRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.auditRoutes = router;
// Get all audits with filtering and pagination
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, dateFrom, dateTo } = req.query;
        const db = admin.firestore();
        let query = db.collection('audits')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        // Apply filters
        if (status) {
            query = query.where('status', '==', status);
        }
        if (type) {
            query = query.where('type', '==', type);
        }
        if (dateFrom) {
            query = query.where('scheduledDate', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            query = query.where('scheduledDate', '<=', new Date(dateTo));
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
        // Get total count
        const totalQuery = db.collection('audits')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        const audits = snapshot.docs.map(doc => {
            var _a, _b, _c, _d;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), scheduledDate: (_c = doc.data().scheduledDate) === null || _c === void 0 ? void 0 : _c.toDate(), completedDate: (_d = doc.data().completedDate) === null || _d === void 0 ? void 0 : _d.toDate() }));
        });
        // Apply text search if provided
        let filteredAudits = audits;
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredAudits = audits.filter((audit) => {
                var _a;
                return audit.title.toLowerCase().includes(searchTerm) ||
                    ((_a = audit.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    audit.scope.toLowerCase().includes(searchTerm);
            });
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
    }
    catch (error) {
        console.error('Get audits error:', error);
        res.status(500).json({
            error: 'Failed to get audits',
            code: 'GET_AUDITS_FAILED',
            details: error.message
        });
    }
});
// Get audit by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b, _c, _d;
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
        const auditData = auditDoc.data();
        // Check tenant access
        if (auditData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        res.json(Object.assign(Object.assign({ id: auditDoc.id }, auditData), { createdAt: (_a = auditData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = auditData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), scheduledDate: (_c = auditData.scheduledDate) === null || _c === void 0 ? void 0 : _c.toDate(), completedDate: (_d = auditData.completedDate) === null || _d === void 0 ? void 0 : _d.toDate() }));
    }
    catch (error) {
        console.error('Get audit error:', error);
        res.status(500).json({
            error: 'Failed to get audit',
            code: 'GET_AUDIT_FAILED',
            details: error.message
        });
    }
});
// Create new audit
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.create'), (0, validation_1.validateRequest)(validation_1.schemas.audit), async (req, res) => {
    try {
        const auditData = Object.assign(Object.assign({}, req.body), { tenantId: req.user.tenantId, createdBy: req.user.uid, status: 'scheduled', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), scheduledDate: new Date(req.body.scheduledDate), auditNumber: await generateAuditNumber(req.user.tenantId), isDeleted: false, findings: [], score: null, completedDate: null });
        const db = admin.firestore();
        const auditRef = await db.collection('audits').add(auditData);
        // Create notifications for assigned auditors
        const notifications = req.body.assignedAuditors.map((auditorId) => ({
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
            tenantId: req.user.tenantId
        }));
        // Batch write notifications
        const batch = db.batch();
        notifications.forEach((notification) => {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, notification);
        });
        await batch.commit();
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'audit',
            entityId: auditRef.id,
            action: 'created',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
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
    }
    catch (error) {
        console.error('Create audit error:', error);
        res.status(500).json({
            error: 'Failed to create audit',
            code: 'CREATE_AUDIT_FAILED',
            details: error.message
        });
    }
});
// Update audit
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
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
        const existingData = auditDoc.data();
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
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                changes: Object.keys(req.body),
                previousStatus: existingData.status,
                newStatus: req.body.status || existingData.status
            }
        });
        res.json({ message: 'Audit updated successfully' });
    }
    catch (error) {
        console.error('Update audit error:', error);
        res.status(500).json({
            error: 'Failed to update audit',
            code: 'UPDATE_AUDIT_FAILED',
            details: error.message
        });
    }
});
// Submit audit findings
router.post('/:id/findings', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
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
        const auditData = auditDoc.data();
        // Check tenant access
        if (auditData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Check if user is assigned to this audit
        if (!auditData.assignedAuditors.includes(req.user.uid) && req.user.role !== 'admin') {
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
            completedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create corrective actions for non-conformities
        const nonConformities = findings.filter((finding) => finding.status === 'non_conformity' || finding.status === 'major_non_conformity');
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
                tenantId: req.user.tenantId,
                createdBy: req.user.uid,
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
            userId: req.user.uid,
            tenantId: req.user.tenantId,
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
    }
    catch (error) {
        console.error('Submit audit findings error:', error);
        res.status(500).json({
            error: 'Failed to submit audit findings',
            code: 'SUBMIT_FINDINGS_FAILED',
            details: error.message
        });
    }
});
// Delete audit
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
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
        const auditData = auditDoc.data();
        // Check tenant access
        if (auditData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
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
            deletedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'audit',
            entityId: id,
            action: 'deleted',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: auditData.title,
                type: auditData.type
            }
        });
        res.json({ message: 'Audit deleted successfully' });
    }
    catch (error) {
        console.error('Delete audit error:', error);
        res.status(500).json({
            error: 'Failed to delete audit',
            code: 'DELETE_AUDIT_FAILED',
            details: error.message
        });
    }
});
// Get audit statistics
router.get('/stats/overview', auth_1.authenticateToken, (0, auth_1.requirePermission)('audits.read'), async (req, res) => {
    try {
        const db = admin.firestore();
        const auditsRef = db.collection('audits')
            .where('tenantId', '==', req.user.tenantId)
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
                var _a;
                const auditDate = (_a = a.scheduledDate) === null || _a === void 0 ? void 0 : _a.toDate();
                const now = new Date();
                return auditDate &&
                    auditDate.getMonth() === now.getMonth() &&
                    auditDate.getFullYear() === now.getFullYear();
            }).length,
            lastMonth: audits.filter(a => {
                var _a;
                const auditDate = (_a = a.scheduledDate) === null || _a === void 0 ? void 0 : _a.toDate();
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return auditDate &&
                    auditDate.getMonth() === lastMonth.getMonth() &&
                    auditDate.getFullYear() === lastMonth.getFullYear();
            }).length
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Get audit stats error:', error);
        res.status(500).json({
            error: 'Failed to get audit statistics',
            code: 'GET_AUDIT_STATS_FAILED',
            details: error.message
        });
    }
});
// Helper function to generate audit number
async function generateAuditNumber(tenantId) {
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
//# sourceMappingURL=audits.js.map