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
exports.correctiveActionRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.correctiveActionRoutes = router;
// Get all corrective actions with filtering and pagination
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, priority, assignedTo, dateFrom, dateTo } = req.query;
        const db = admin.firestore();
        let query = db.collection('correctiveActions')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        // Apply filters
        if (status) {
            query = query.where('status', '==', status);
        }
        if (type) {
            query = query.where('type', '==', type);
        }
        if (priority) {
            query = query.where('priority', '==', priority);
        }
        if (assignedTo) {
            query = query.where('assignedTo', '==', assignedTo);
        }
        if (dateFrom) {
            query = query.where('dueDate', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            query = query.where('dueDate', '<=', new Date(dateTo));
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
        const totalQuery = db.collection('correctiveActions')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        const correctiveActions = snapshot.docs.map(doc => {
            var _a, _b, _c, _d;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), dueDate: (_c = doc.data().dueDate) === null || _c === void 0 ? void 0 : _c.toDate(), completedDate: (_d = doc.data().completedDate) === null || _d === void 0 ? void 0 : _d.toDate() }));
        });
        // Apply text search if provided
        let filteredActions = correctiveActions;
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredActions = correctiveActions.filter((action) => {
                var _a;
                return action.title.toLowerCase().includes(searchTerm) ||
                    ((_a = action.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm));
            });
        }
        res.json({
            correctiveActions: filteredActions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get corrective actions error:', error);
        res.status(500).json({
            error: 'Failed to get corrective actions',
            code: 'GET_CORRECTIVE_ACTIONS_FAILED',
            details: error.message
        });
    }
});
// Get corrective action by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const actionDoc = await db.collection('correctiveActions').doc(id).get();
        if (!actionDoc.exists) {
            res.status(404).json({
                error: 'Corrective action not found',
                code: 'CORRECTIVE_ACTION_NOT_FOUND'
            });
            return;
        }
        const actionData = actionDoc.data();
        // Check tenant access
        if (actionData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        res.json(Object.assign(Object.assign({ id: actionDoc.id }, actionData), { createdAt: (_a = actionData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = actionData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), dueDate: (_c = actionData.dueDate) === null || _c === void 0 ? void 0 : _c.toDate(), completedDate: (_d = actionData.completedDate) === null || _d === void 0 ? void 0 : _d.toDate() }));
    }
    catch (error) {
        console.error('Get corrective action error:', error);
        res.status(500).json({
            error: 'Failed to get corrective action',
            code: 'GET_CORRECTIVE_ACTION_FAILED',
            details: error.message
        });
    }
});
// Create new corrective action
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.create'), (0, validation_1.validateRequest)(validation_1.schemas.correctiveAction), async (req, res) => {
    try {
        const actionData = Object.assign(Object.assign({}, req.body), { tenantId: req.user.tenantId, createdBy: req.user.uid, status: 'open', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), dueDate: new Date(req.body.dueDate), isDeleted: false, completedDate: null, actionNumber: await generateActionNumber(req.user.tenantId) });
        const db = admin.firestore();
        const actionRef = await db.collection('correctiveActions').add(actionData);
        // Create notification for assigned user
        if (req.body.assignedTo) {
            await db.collection('notifications').add({
                userId: req.body.assignedTo,
                type: 'corrective_action_assigned',
                title: 'New Corrective Action Assignment',
                message: `You have been assigned a corrective action: ${actionData.title}`,
                data: {
                    actionId: actionRef.id,
                    dueDate: actionData.dueDate
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
                tenantId: req.user.tenantId
            });
        }
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'corrective_action',
            entityId: actionRef.id,
            action: 'created',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: actionData.title,
                type: actionData.type,
                priority: actionData.priority,
                assignedTo: req.body.assignedTo
            }
        });
        res.status(201).json({
            id: actionRef.id,
            message: 'Corrective action created successfully'
        });
    }
    catch (error) {
        console.error('Create corrective action error:', error);
        res.status(500).json({
            error: 'Failed to create corrective action',
            code: 'CREATE_CORRECTIVE_ACTION_FAILED',
            details: error.message
        });
    }
});
// Update corrective action
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const actionDoc = await db.collection('correctiveActions').doc(id).get();
        if (!actionDoc.exists) {
            res.status(404).json({
                error: 'Corrective action not found',
                code: 'CORRECTIVE_ACTION_NOT_FOUND'
            });
            return;
        }
        const existingData = actionDoc.data();
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
        if (req.body.dueDate) {
            updateData.dueDate = new Date(req.body.dueDate);
        }
        // If status is being changed to completed, set completion date
        if (req.body.status === 'completed' && existingData.status !== 'completed') {
            updateData.completedDate = admin.firestore.FieldValue.serverTimestamp();
            updateData.completedBy = req.user.uid;
        }
        await actionDoc.ref.update(updateData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'corrective_action',
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
        res.json({ message: 'Corrective action updated successfully' });
    }
    catch (error) {
        console.error('Update corrective action error:', error);
        res.status(500).json({
            error: 'Failed to update corrective action',
            code: 'UPDATE_CORRECTIVE_ACTION_FAILED',
            details: error.message
        });
    }
});
// Delete corrective action
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const actionDoc = await db.collection('correctiveActions').doc(id).get();
        if (!actionDoc.exists) {
            res.status(404).json({
                error: 'Corrective action not found',
                code: 'CORRECTIVE_ACTION_NOT_FOUND'
            });
            return;
        }
        const actionData = actionDoc.data();
        // Check tenant access
        if (actionData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Soft delete
        await actionDoc.ref.update({
            isDeleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
            deletedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'corrective_action',
            entityId: id,
            action: 'deleted',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: actionData.title,
                type: actionData.type
            }
        });
        res.json({ message: 'Corrective action deleted successfully' });
    }
    catch (error) {
        console.error('Delete corrective action error:', error);
        res.status(500).json({
            error: 'Failed to delete corrective action',
            code: 'DELETE_CORRECTIVE_ACTION_FAILED',
            details: error.message
        });
    }
});
// Get corrective action statistics
router.get('/stats/overview', auth_1.authenticateToken, (0, auth_1.requirePermission)('corrective_actions.read'), async (req, res) => {
    try {
        const db = admin.firestore();
        const actionsRef = db.collection('correctiveActions')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        const snapshot = await actionsRef.get();
        const actions = snapshot.docs.map(doc => doc.data());
        const now = new Date();
        const stats = {
            total: actions.length,
            byStatus: {
                open: actions.filter(a => a.status === 'open').length,
                in_progress: actions.filter(a => a.status === 'in_progress').length,
                completed: actions.filter(a => a.status === 'completed').length,
                cancelled: actions.filter(a => a.status === 'cancelled').length
            },
            byPriority: {
                low: actions.filter(a => a.priority === 'low').length,
                medium: actions.filter(a => a.priority === 'medium').length,
                high: actions.filter(a => a.priority === 'high').length,
                critical: actions.filter(a => a.priority === 'critical').length
            },
            byType: {
                corrective: actions.filter(a => a.type === 'corrective').length,
                preventive: actions.filter(a => a.type === 'preventive').length,
                improvement: actions.filter(a => a.type === 'improvement').length
            },
            overdue: actions.filter(a => {
                var _a;
                const dueDate = (_a = a.dueDate) === null || _a === void 0 ? void 0 : _a.toDate();
                return dueDate && dueDate < now && a.status !== 'completed';
            }).length,
            dueSoon: actions.filter(a => {
                var _a;
                const dueDate = (_a = a.dueDate) === null || _a === void 0 ? void 0 : _a.toDate();
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return dueDate && dueDate <= nextWeek && dueDate >= now && a.status !== 'completed';
            }).length
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Get corrective action stats error:', error);
        res.status(500).json({
            error: 'Failed to get corrective action statistics',
            code: 'GET_CORRECTIVE_ACTION_STATS_FAILED',
            details: error.message
        });
    }
});
// Helper function to generate action number
async function generateActionNumber(tenantId) {
    const db = admin.firestore();
    const year = new Date().getFullYear();
    const prefix = `CA-${year}`;
    // Get the last action number for this year
    const lastActionQuery = await db.collection('correctiveActions')
        .where('tenantId', '==', tenantId)
        .where('actionNumber', '>=', prefix)
        .where('actionNumber', '<', `CA-${year + 1}`)
        .orderBy('actionNumber', 'desc')
        .limit(1)
        .get();
    let nextNumber = 1;
    if (!lastActionQuery.empty) {
        const lastActionNumber = lastActionQuery.docs[0].data().actionNumber;
        const lastNumber = parseInt(lastActionNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
    }
    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
}
//# sourceMappingURL=correctiveActions.js.map