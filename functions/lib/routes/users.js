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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.userRoutes = router;
// Get all users with filtering and pagination
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, role, department, isActive } = req.query;
        const db = admin.firestore();
        let query = db.collection('users')
            .where('tenantId', '==', req.user.tenantId);
        // Apply filters
        if (role) {
            query = query.where('role', '==', role);
        }
        if (department) {
            query = query.where('department', '==', department);
        }
        if (isActive !== undefined) {
            query = query.where('isActive', '==', isActive === 'true');
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
        const totalQuery = db.collection('users')
            .where('tenantId', '==', req.user.tenantId);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        let users = snapshot.docs.map(doc => {
            var _a, _b, _c;
            const userData = doc.data();
            // Remove sensitive data
            const { hashedPassword } = userData, safeUserData = __rest(userData, ["hashedPassword"]);
            return Object.assign(Object.assign({ id: doc.id }, safeUserData), { createdAt: (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = userData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), lastLogin: (_c = userData.lastLogin) === null || _c === void 0 ? void 0 : _c.toDate() });
        });
        // Apply text search if provided
        if (search) {
            const searchTerm = search.toLowerCase();
            users = users.filter((user) => {
                var _a, _b;
                return user.firstName.toLowerCase().includes(searchTerm) ||
                    user.lastName.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    ((_a = user.department) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    ((_b = user.position) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm));
            });
        }
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to get users',
            code: 'GET_USERS_FAILED',
            details: error.message
        });
    }
});
// Get user by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const userData = userDoc.data();
        // Check tenant access
        if (userData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Remove sensitive data
        const { hashedPassword } = userData, safeUserData = __rest(userData, ["hashedPassword"]);
        res.json(Object.assign(Object.assign({ id: userDoc.id }, safeUserData), { createdAt: (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = userData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), lastLogin: (_c = userData.lastLogin) === null || _c === void 0 ? void 0 : _c.toDate() }));
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            code: 'GET_USER_FAILED',
            details: error.message
        });
    }
});
// Create new user
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.create'), async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, department, position, phone } = req.body;
        // Check if user already exists
        const db = admin.firestore();
        const existingUser = await db.collection('users').where('email', '==', email).get();
        if (!existingUser.empty) {
            res.status(400).json({
                error: 'User already exists',
                code: 'USER_EXISTS'
            });
            return;
        }
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            emailVerified: false
        });
        // Hash password for storage
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user document in Firestore
        const userData = {
            email,
            firstName,
            lastName,
            role: role || 'employee',
            department,
            position,
            phone,
            tenantId: req.user.tenantId,
            permissions: getDefaultPermissions(role || 'employee'),
            createdBy: req.user.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            lastLogin: null,
            profilePicture: null,
            hashedPassword
        };
        await db.collection('users').doc(userRecord.uid).set(userData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'user',
            entityId: userRecord.uid,
            action: 'created',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                email,
                firstName,
                lastName,
                role: userData.role,
                department
            }
        });
        res.status(201).json({
            id: userRecord.uid,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            code: 'CREATE_USER_FAILED',
            details: error.message
        });
    }
});
// Update user
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const existingData = userDoc.data();
        // Check tenant access
        if (existingData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Users can only update their own profile unless they have admin permissions
        if (id !== req.user.uid && !((_a = req.user.permissions) === null || _a === void 0 ? void 0 : _a.includes('users.update'))) {
            res.status(403).json({
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastModifiedBy: req.user.uid });
        // Update permissions if role is changed
        if (req.body.role && req.body.role !== existingData.role) {
            updateData.permissions = getDefaultPermissions(req.body.role);
        }
        // Hash new password if provided
        if (req.body.password) {
            updateData.hashedPassword = await bcryptjs_1.default.hash(req.body.password, 12);
            // Update Firebase Auth password
            await admin.auth().updateUser(id, {
                password: req.body.password
            });
            // Remove password from update data
            delete updateData.password;
        }
        // Update Firebase Auth profile if name or email changed
        const authUpdates = {};
        if (req.body.firstName || req.body.lastName) {
            authUpdates.displayName = `${req.body.firstName || existingData.firstName} ${req.body.lastName || existingData.lastName}`;
        }
        if (req.body.email && req.body.email !== existingData.email) {
            authUpdates.email = req.body.email;
        }
        if (Object.keys(authUpdates).length > 0) {
            await admin.auth().updateUser(id, authUpdates);
        }
        await userDoc.ref.update(updateData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'user',
            entityId: id,
            action: 'updated',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                changes: Object.keys(req.body).filter(key => key !== 'password'),
                previousRole: existingData.role,
                newRole: req.body.role || existingData.role
            }
        });
        res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Failed to update user',
            code: 'UPDATE_USER_FAILED',
            details: error.message
        });
    }
});
// Deactivate user
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const userData = userDoc.data();
        // Check tenant access
        if (userData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Prevent users from deactivating themselves
        if (id === req.user.uid) {
            res.status(400).json({
                error: 'Cannot deactivate your own account',
                code: 'CANNOT_DEACTIVATE_SELF'
            });
            return;
        }
        // Soft delete - deactivate instead of deleting
        await userDoc.ref.update({
            isActive: false,
            deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deactivatedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Disable Firebase Auth user
        await admin.auth().updateUser(id, {
            disabled: true
        });
        // Revoke all refresh tokens
        await admin.auth().revokeRefreshTokens(id);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'user',
            entityId: id,
            action: 'deactivated',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role
            }
        });
        res.json({ message: 'User deactivated successfully' });
    }
    catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({
            error: 'Failed to deactivate user',
            code: 'DEACTIVATE_USER_FAILED',
            details: error.message
        });
    }
});
// Reactivate user
router.post('/:id/reactivate', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.update'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const userData = userDoc.data();
        // Check tenant access
        if (userData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Reactivate user
        await userDoc.ref.update({
            isActive: true,
            reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            reactivatedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Enable Firebase Auth user
        await admin.auth().updateUser(id, {
            disabled: false
        });
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'user',
            entityId: id,
            action: 'reactivated',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role
            }
        });
        res.json({ message: 'User reactivated successfully' });
    }
    catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({
            error: 'Failed to reactivate user',
            code: 'REACTIVATE_USER_FAILED',
            details: error.message
        });
    }
});
// Get user activity logs
router.get('/:id/activity', auth_1.authenticateToken, (0, auth_1.requirePermission)('users.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const db = admin.firestore();
        // Check if user exists and has access
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const userData = userDoc.data();
        if (userData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        let query = db.collection('activityLogs')
            .where('userId', '==', id)
            .where('tenantId', '==', req.user.tenantId)
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
        const activities = snapshot.docs.map(doc => {
            var _a;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { timestamp: (_a = doc.data().timestamp) === null || _a === void 0 ? void 0 : _a.toDate() }));
        });
        res.json({
            activities,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                hasMore: snapshot.docs.length === Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({
            error: 'Failed to get user activity',
            code: 'GET_USER_ACTIVITY_FAILED',
            details: error.message
        });
    }
});
// Helper function to get default permissions based on role
function getDefaultPermissions(role) {
    const permissionMap = {
        admin: [
            'incidents.create', 'incidents.read', 'incidents.update', 'incidents.delete',
            'documents.create', 'documents.read', 'documents.update', 'documents.delete',
            'audits.create', 'audits.read', 'audits.update', 'audits.delete',
            'corrective_actions.create', 'corrective_actions.read', 'corrective_actions.update', 'corrective_actions.delete',
            'users.create', 'users.read', 'users.update', 'users.delete',
            'tenants.read', 'tenants.update',
            'reports.create', 'reports.read', 'reports.export',
            'settings.read', 'settings.update'
        ],
        safety_manager: [
            'incidents.create', 'incidents.read', 'incidents.update',
            'documents.create', 'documents.read', 'documents.update',
            'audits.create', 'audits.read', 'audits.update',
            'corrective_actions.create', 'corrective_actions.read', 'corrective_actions.update',
            'users.read', 'reports.create', 'reports.read', 'reports.export'
        ],
        supervisor: [
            'incidents.create', 'incidents.read', 'incidents.update',
            'documents.read', 'audits.read', 'audits.update',
            'corrective_actions.create', 'corrective_actions.read', 'corrective_actions.update',
            'reports.read'
        ],
        employee: [
            'incidents.create', 'incidents.read',
            'documents.read', 'audits.read',
            'corrective_actions.read'
        ],
        auditor: [
            'incidents.read', 'documents.read',
            'audits.create', 'audits.read', 'audits.update',
            'corrective_actions.read', 'reports.read'
        ],
        contractor: [
            'incidents.create', 'incidents.read',
            'documents.read', 'audits.read'
        ],
        viewer: [
            'incidents.read', 'documents.read',
            'audits.read', 'corrective_actions.read', 'reports.read'
        ],
        guest: [
            'documents.read'
        ]
    };
    return permissionMap[role] || permissionMap.guest;
}
//# sourceMappingURL=users.js.map