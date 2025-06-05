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
exports.tenantRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.tenantRoutes = router;
// Get all tenants (admin only)
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        // Only super admins can view all tenants
        if (req.user.role !== 'super_admin') {
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
        let tenants = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
        });
        // Apply text search if provided
        if (search) {
            const searchTerm = search.toLowerCase();
            tenants = tenants.filter((tenant) => {
                var _a, _b;
                return tenant.name.toLowerCase().includes(searchTerm) ||
                    ((_a = tenant.domain) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    ((_b = tenant.industry) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm));
            });
        }
        res.json({
            tenants,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                hasMore: snapshot.docs.length === Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({
            error: 'Failed to get tenants',
            code: 'GET_TENANTS_FAILED',
            details: error.message
        });
    }
});
// Get current tenant
router.get('/current', auth_1.authenticateToken, async (req, res) => {
    var _a, _b;
    try {
        const db = admin.firestore();
        const tenantDoc = await db.collection('tenants').doc(req.user.tenantId).get();
        if (!tenantDoc.exists) {
            res.status(404).json({
                error: 'Tenant not found',
                code: 'TENANT_NOT_FOUND'
            });
            return;
        }
        const tenantData = tenantDoc.data();
        res.json(Object.assign(Object.assign({ id: tenantDoc.id }, tenantData), { createdAt: (_a = tenantData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = tenantData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
    }
    catch (error) {
        console.error('Get current tenant error:', error);
        res.status(500).json({
            error: 'Failed to get current tenant',
            code: 'GET_CURRENT_TENANT_FAILED',
            details: error.message
        });
    }
});
// Get tenant by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b;
    try {
        const { id } = req.params;
        // Users can only view their own tenant unless they're super admin
        if (id !== req.user.tenantId && req.user.role !== 'super_admin') {
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
        const tenantData = tenantDoc.data();
        res.json(Object.assign(Object.assign({ id: tenantDoc.id }, tenantData), { createdAt: (_a = tenantData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = tenantData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
    }
    catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({
            error: 'Failed to get tenant',
            code: 'GET_TENANT_FAILED',
            details: error.message
        });
    }
});
// Create new tenant (super admin only)
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.create'), async (req, res) => {
    try {
        // Only super admins can create tenants
        if (req.user.role !== 'super_admin') {
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
        const tenantData = Object.assign(Object.assign({}, req.body), { createdBy: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), isActive: true, settings: Object.assign({ timezone: req.body.timezone || 'UTC', dateFormat: req.body.dateFormat || 'MM/DD/YYYY', currency: req.body.currency || 'USD', language: req.body.language || 'en' }, req.body.settings), subscription: Object.assign({ plan: req.body.plan || 'basic', status: 'active', startDate: admin.firestore.FieldValue.serverTimestamp() }, req.body.subscription) });
        const tenantRef = await db.collection('tenants').add(tenantData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'tenant',
            entityId: tenantRef.id,
            action: 'created',
            userId: req.user.uid,
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
    }
    catch (error) {
        console.error('Create tenant error:', error);
        res.status(500).json({
            error: 'Failed to create tenant',
            code: 'CREATE_TENANT_FAILED',
            details: error.message
        });
    }
});
// Update tenant
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        // Users can only update their own tenant unless they're super admin
        if (id !== req.user.tenantId && req.user.role !== 'super_admin') {
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
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastModifiedBy: req.user.uid });
        // Merge settings if provided
        if (req.body.settings) {
            const existingData = tenantDoc.data();
            updateData.settings = Object.assign(Object.assign({}, existingData.settings), req.body.settings);
        }
        await tenantDoc.ref.update(updateData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'tenant',
            entityId: id,
            action: 'updated',
            userId: req.user.uid,
            tenantId: id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                changes: Object.keys(req.body)
            }
        });
        res.json({ message: 'Tenant updated successfully' });
    }
    catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({
            error: 'Failed to update tenant',
            code: 'UPDATE_TENANT_FAILED',
            details: error.message
        });
    }
});
// Deactivate tenant (super admin only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        // Only super admins can deactivate tenants
        if (req.user.role !== 'super_admin') {
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
            deactivatedBy: req.user.uid,
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
            userId: req.user.uid,
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
    }
    catch (error) {
        console.error('Deactivate tenant error:', error);
        res.status(500).json({
            error: 'Failed to deactivate tenant',
            code: 'DEACTIVATE_TENANT_FAILED',
            details: error.message
        });
    }
});
// Get tenant statistics
router.get('/:id/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('tenants.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        // Users can only view their own tenant stats unless they're super admin
        if (id !== req.user.tenantId && req.user.role !== 'super_admin') {
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
                    var _a;
                    const incidentDate = (_a = i.dateOccurred) === null || _a === void 0 ? void 0 : _a.toDate();
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
                    var _a;
                    const dueDate = (_a = a.dueDate) === null || _a === void 0 ? void 0 : _a.toDate();
                    return dueDate && dueDate < new Date() && a.status !== 'completed';
                }).length
            }
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Get tenant stats error:', error);
        res.status(500).json({
            error: 'Failed to get tenant statistics',
            code: 'GET_TENANT_STATS_FAILED',
            details: error.message
        });
    }
});
//# sourceMappingURL=tenants.js.map