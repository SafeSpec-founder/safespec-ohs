import { Router } from 'express';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Get all users with filtering and pagination
router.get('/',
  authenticateToken,
  requirePermission('users.read'),
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        role,
        department,
        isActive
      } = req.query;

      const db = admin.firestore();
      let query = db.collection('users')
        .where('tenantId', '==', req.user!.tenantId);

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
      const totalQuery = db.collection('users')
        .where('tenantId', '==', req.user!.tenantId);
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      let users = snapshot.docs.map(doc => {
        const userData = doc.data();
        // Remove sensitive data
        const { hashedPassword, ...safeUserData } = userData;
        return {
          id: doc.id,
          ...safeUserData,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate(),
          lastLogin: userData.lastLogin?.toDate()
        };
      });

      // Apply text search if provided
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        users = users.filter((user: any) =>
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.department?.toLowerCase().includes(searchTerm) ||
          user.position?.toLowerCase().includes(searchTerm)
        );
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
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Failed to get users',
        code: 'GET_USERS_FAILED',
        details: error.message
      });
    }
  }
);

// Get user by ID
router.get('/:id',
  authenticateToken,
  requirePermission('users.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const userData = userDoc.data()!;
      
      // Check tenant access
      if (userData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Remove sensitive data
      const { hashedPassword, ...safeUserData } = userData;
      
      res.json({
        id: userDoc.id,
        ...safeUserData,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
        lastLogin: userData.lastLogin?.toDate()
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to get user',
        code: 'GET_USER_FAILED',
        details: error.message
      });
    }
  }
);

// Create new user
router.post('/',
  authenticateToken,
  requirePermission('users.create'),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user document in Firestore
      const userData = {
        email,
        firstName,
        lastName,
        role: role || 'employee',
        department,
        position,
        phone,
        tenantId: req.user!.tenantId,
        permissions: getDefaultPermissions(role || 'employee'),
        createdBy: req.user!.uid,
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
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
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({
        error: 'Failed to create user',
        code: 'CREATE_USER_FAILED',
        details: error.message
      });
    }
  }
);

// Update user
router.put('/:id',
  authenticateToken,
  requirePermission('users.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const existingData = userDoc.data()!;
      
      // Check tenant access
      if (existingData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Users can only update their own profile unless they have admin permissions
      if (id !== req.user!.uid && !req.user!.permissions?.includes('users.update')) {
        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      const updateData: any = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.user!.uid
      };

      // Update permissions if role is changed
      if (req.body.role && req.body.role !== existingData.role) {
        updateData.permissions = getDefaultPermissions(req.body.role);
      }

      // Hash new password if provided
      if (req.body.password) {
        updateData.hashedPassword = await bcrypt.hash(req.body.password, 12);
        
        // Update Firebase Auth password
        await admin.auth().updateUser(id, {
          password: req.body.password
        });
        
        // Remove password from update data
        delete updateData.password;
      }

      // Update Firebase Auth profile if name or email changed
      const authUpdates: any = {};
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          changes: Object.keys(req.body).filter(key => key !== 'password'),
          previousRole: existingData.role,
          newRole: req.body.role || existingData.role
        }
      });

      res.json({ message: 'User updated successfully' });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Failed to update user',
        code: 'UPDATE_USER_FAILED',
        details: error.message
      });
    }
  }
);

// Deactivate user
router.delete('/:id',
  authenticateToken,
  requirePermission('users.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const userData = userDoc.data()!;
      
      // Check tenant access
      if (userData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Prevent users from deactivating themselves
      if (id === req.user!.uid) {
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
        deactivatedBy: req.user!.uid,
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });

      res.json({ message: 'User deactivated successfully' });
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        error: 'Failed to deactivate user',
        code: 'DEACTIVATE_USER_FAILED',
        details: error.message
      });
    }
  }
);

// Reactivate user
router.post('/:id/reactivate',
  authenticateToken,
  requirePermission('users.update'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const userData = userDoc.data()!;
      
      // Check tenant access
      if (userData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
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
        reactivatedBy: req.user!.uid,
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });

      res.json({ message: 'User reactivated successfully' });
    } catch (error: any) {
      console.error('Reactivate user error:', error);
      res.status(500).json({
        error: 'Failed to reactivate user',
        code: 'REACTIVATE_USER_FAILED',
        details: error.message
      });
    }
  }
);

// Get user activity logs
router.get('/:id/activity',
  authenticateToken,
  requirePermission('users.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const userData = userDoc.data()!;
      if (userData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      let query = db.collection('activityLogs')
        .where('userId', '==', id)
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
      
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      res.json({
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: snapshot.docs.length === Number(limit)
        }
      });
    } catch (error: any) {
      console.error('Get user activity error:', error);
      res.status(500).json({
        error: 'Failed to get user activity',
        code: 'GET_USER_ACTIVITY_FAILED',
        details: error.message
      });
    }
  }
);

// Helper function to get default permissions based on role
function getDefaultPermissions(role: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
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

export { router as userRoutes };

