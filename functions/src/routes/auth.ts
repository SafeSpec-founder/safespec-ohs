import { Router } from 'express';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register',
  validateRequest(schemas.register),
  async (req, res): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'employee', tenantId } = req.body;

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
      role,
      tenantId: tenantId || 'default',
      permissions: getDefaultPermissions(role),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLogin: null,
      profilePicture: null,
      phone: null,
      department: null,
      position: null,
      hashedPassword // Store for backup authentication
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userRecord.uid,
        email,
        firstName,
        lastName,
        role,
        tenantId: userData.tenantId,
        permissions: userData.permissions
      },
      customToken
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      code: 'REGISTRATION_FAILED',
      details: error.message
    });
  }
});

// Login user
router.post('/login',
  validateRequest(schemas.login),
  async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Get user from Firestore
    const db = admin.firestore();
    const userQuery = await db.collection('users').where('email', '==', email).get();
    
    if (userQuery.empty) {
      res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      res.status(401).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.hashedPassword);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Create custom token for Firebase Auth
    const customToken = await admin.auth().createCustomToken(userDoc.id);
    
    // Generate refresh token
    const refreshToken = 'placeholder_refresh_token'; // Simplified for now
    
    // Store refresh token in Firestore
    await db.collection('refreshTokens').add({
      userId: userDoc.id,
      token: refreshToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Update last login
    await userDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        tenantId: userData.tenantId,
        permissions: userData.permissions
      },
      token: customToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_FAILED',
      details: error.message
    });
  }
});

// Refresh token
router.post('/refresh',
  async (req, res): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
      return;
    }

    // Verify refresh token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(refreshToken);
    if (!decodedToken) {
      res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    // Check if refresh token exists in database
    const db = admin.firestore();
    const tokenQuery = await db.collection('refreshTokens')
      .where('userId', '==', decodedToken.uid)
      .where('token', '==', refreshToken)
      .get();

    if (tokenQuery.empty) {
      res.status(401).json({
        error: 'Refresh token not found',
        code: 'REFRESH_TOKEN_NOT_FOUND'
      });
      return;
    }

    const tokenDoc = tokenQuery.docs[0];
    const tokenData = tokenDoc.data();

    // Check if token is expired
    if (tokenData.expiresAt.toDate() < new Date()) {
      await tokenDoc.ref.delete();
      res.status(401).json({
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
      return;
    }

    // Get user data
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userData = userDoc.data()!;

    // Generate new tokens
    const newCustomToken = await admin.auth().createCustomToken(decodedToken.uid);
    const newRefreshToken = 'new_placeholder_refresh_token'; // Simplified for now

    // Delete old refresh token and create new one
    await tokenDoc.ref.delete();
    await db.collection('refreshTokens').add({
      userId: decodedToken.uid,
      token: newRefreshToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.json({
      token: newCustomToken,
      refreshToken: newRefreshToken,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        tenantId: userData.tenantId,
        permissions: userData.permissions
      }
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      code: 'TOKEN_REFRESH_FAILED',
      details: error.message
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      const db = admin.firestore();
      const tokenQuery = await db.collection('refreshTokens')
        .where('userId', '==', req.user!.uid)
        .where('token', '==', refreshToken)
        .get();

      if (!tokenQuery.empty) {
        await tokenQuery.docs[0].ref.delete();
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_FAILED',
      details: error.message
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
      return;
    }

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // TODO: Send email with reset link using SendGrid
    // For now, return the link (in production, this should be sent via email)
    
    res.json({
      message: 'Password reset link sent',
      resetLink // Remove this in production
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to send reset link',
      code: 'RESET_LINK_FAILED',
      details: error.message
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res): Promise<void> => {
  try {
    const { oobCode, newPassword, email } = req.body;

    if (!oobCode || !newPassword) {
      res.status(400).json({
        error: 'Reset code and new password are required',
        code: 'MISSING_PARAMETERS'
      });
      return;
    }

    // Update password directly (in production, you'd want more validation)
    // Note: This is a simplified approach - in production you'd validate the oobCode properly
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to reset password',
      code: 'PASSWORD_RESET_FAILED',
      details: error.message
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user!.uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userData = userDoc.data()!;
    
    res.json({
      id: userDoc.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      tenantId: userData.tenantId,
      permissions: userData.permissions,
      phone: userData.phone,
      department: userData.department,
      position: userData.position,
      profilePicture: userData.profilePicture,
      lastLogin: userData.lastLogin,
      createdAt: userData.createdAt
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      code: 'GET_PROFILE_FAILED',
      details: error.message
    });
  }
});

// Helper function to get default permissions based on role
function getDefaultPermissions(role: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    admin: [
      'incidents.create', 'incidents.read', 'incidents.update', 'incidents.delete',
      'documents.create', 'documents.read', 'documents.update', 'documents.delete',
      'audits.create', 'audits.read', 'audits.update', 'audits.delete',
      'corrective_actions.create', 'corrective_actions.read', 'corrective_actions.update', 'corrective_actions.delete',
      'users.create', 'users.read', 'users.update', 'users.delete',
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

export { router as authRoutes };

