const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

admin.initializeApp();

const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

exports.getUserRole = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const userId = auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  const userRole = userDoc.data().role;
  return { role: userRole };
});

/**
 * Set user role (admin only)
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId, newRole } = data;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!targetUserId || !newRole) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId and newRole are required');
  }

  // Check if user has admin permissions
  const hasPermission = await checkPermission(auth.uid, 'admin');
  if (!hasPermission) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  // Validate role
  const validRoles = ['user', 'supervisor', 'manager', 'admin', 'super_admin'];
  if (!validRoles.includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified');
  }

  try {
    await db.collection('users').doc(targetUserId).update({
      role: newRole,
      updatedAt: moment().toISOString(),
    });

    await logAuditActivity(auth.uid, 'ROLE_CHANGED', {
      targetUserId,
      newRole,
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set user role');
  }
});

/**
 * Update login timestamp
 */
exports.updateLoginTimestamp = functions.https.onCall(async (data, context) => {
  const { auth } = context;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await db.collection('users').doc(auth.uid).update({
      lastLoginAt: moment().toISOString(),
    });

    await logAuditActivity(auth.uid, 'USER_LOGIN', {});

    return { success: true };
  } catch (error) {
    console.error('Error updating login timestamp:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update login timestamp');
  }
});

/**
 * Create user profile when a new user signs up
 */
exports.createUserOnSignUp = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  try {
    // Create user profile in Firestore
    await db
      .collection('users')
      .doc(uid)
      .set({
        uid,
        email,
        displayName: displayName || (email ? email.split('@')[0] : ''),
        role: 'user',
        status: 'active',
        isActive: true,
        createdAt: moment().toISOString(),
        updatedAt: moment().toISOString(),
        profile: {
          firstName: '',
          lastName: '',
          department: '',
          position: '',
          phone: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
          },
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          language: 'en',
          timezone: 'UTC',
        },
        permissions: {
          incidents: ['read', 'create'],
          documents: ['read'],
          reports: ['read'],
          compliance: ['read'],
        },
      });

    // Log the user creation
    await logAuditActivity(uid, 'USER_CREATED', {
      email,
      displayName,
    });

    // Assign default custom claims for role and activation status
    await admin.auth().setCustomUserClaims(uid, {
      role: 'user',
      isActive: true,
    });

    console.log(`User profile created for ${email || uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});

/**
 * Clean up user data when user is deleted
 */
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  try {
    // Delete user profile
    await admin.firestore().collection('users').doc(uid).delete();

    // Archive user's incidents instead of deleting
    const incidentsSnapshot = await admin.firestore()
      .collection('incidents')
      .where('reportedBy', '==', uid)
      .get();

    const batch = admin.firestore().batch();
    incidentsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        reportedBy: 'DELETED_USER',
        archivedAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    console.log(`User data cleaned up for UID: ${uid}`);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});

/**
 * Create incident report
 */
exports.createIncident = functions.https.onCall(async (data, context) => {
  const { auth } = context;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate incident data
  const schema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(10),
    severity: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    dateOccurred: Joi.string().isoDate().required(),
    injuryType: Joi.string().allow(''),
    bodyPart: Joi.string().allow(''),
    witnesses: Joi.array().items(Joi.string()),
    immediateActions: Joi.string().allow(''),
    attachments: Joi.array().items(Joi.string()),
  });

  const { error, value } = schema.validate(data);
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }

  try {
    const incidentId = uuidv4();
    const incidentData = {
      id: incidentId,
      ...value,
      reportedBy: auth.uid,
      status: 'open',
      priority: calculatePriority(value.severity, value.category),
      createdAt: moment().toISOString(),
      updatedAt: moment().toISOString(),
      workflow: {
        currentStage: 'reported',
        stages: [
          {
            name: 'reported',
            completedAt: moment().toISOString(),
            completedBy: auth.uid,
          },
        ],
      },
    };

    await db.collection('incidents').doc(incidentId).set(incidentData);

    // Create notification for supervisors
    await createNotification({
      type: 'incident_reported',
      title: 'New Incident Reported',
      message: `Incident "${value.title}" has been reported`,
      targetRoles: ['supervisor', 'manager', 'admin'],
      targetUsers: [],
      data: { incidentId },
    });

    await logAuditActivity(auth.uid, 'INCIDENT_CREATED', {
      incidentId,
      severity: value.severity,
    });

    return { incidentId, success: true };
  } catch (error) {
    console.error('Error creating incident:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create incident');
  }
});

/**
 * Get incident by ID (secure, role-aware)
 */
exports.getIncidentById = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { incidentId } = data;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate input
  const schema = Joi.object({
    incidentId: Joi.string().required(),
  });
  const { error } = schema.validate({ incidentId });
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }

  try {
    const incidentDoc = await db.collection('incidents').doc(incidentId).get();
    if (!incidentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Incident not found');
    }
    const incident = incidentDoc.data();

    // Only allow access if user is admin, manager, supervisor, or the reporter
    const userRole = await fetchUserRoleFromDb(auth.uid);
    if (
      !['admin', 'super_admin', 'manager', 'supervisor'].includes(userRole) &&
      incident.reportedBy !== auth.uid
    ) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    await logAuditActivity(auth.uid, 'INCIDENT_VIEWED', { incidentId });

    return { incident };
  } catch (err) {
    console.error('Error fetching incident:', err);
    throw new functions.https.HttpsError('internal', 'Failed to fetch incident');
  }
});

/**
 * Get all incidents for the authenticated user (role-aware)
 */
exports.getUserIncidents = functions.https.onCall(async (data, context) => {
  const { auth } = context;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userRole = await fetchUserRoleFromDb(auth.uid);
    let incidentsQuery;

    // Admins, managers, supervisors see all; users see only their own
    if (['admin', 'super_admin', 'manager', 'supervisor'].includes(userRole)) {
      incidentsQuery = db.collection('incidents');
    } else {
      incidentsQuery = db.collection('incidents').where('reportedBy', '==', auth.uid);
    }

    const snapshot = await incidentsQuery.get();
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    await logAuditActivity(auth.uid, 'INCIDENTS_LIST_VIEWED', { count: incidents.length });

    return { incidents };
  } catch (error) {
    console.error('Error fetching user incidents:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch incidents');
  }
});

/**
 * Download incident report as PDF (secure, role-aware)
 */
exports.downloadIncidentReport = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { incidentId } = data;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate input
  const schema = Joi.object({
    incidentId: Joi.string().required(),
  });
  const { error } = schema.validate({ incidentId });
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }

  try {
    const incidentDoc = await db.collection('incidents').doc(incidentId).get();
    if (!incidentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Incident not found');
    }
    const incident = incidentDoc.data();

    // Only allow access if user is admin, manager, supervisor, or the reporter
    const userRole = await fetchUserRoleFromDb(auth.uid);
    if (
      !['admin', 'super_admin', 'manager', 'supervisor'].includes(userRole) &&
      incident.reportedBy !== auth.uid
    ) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    // Generate PDF
    const pdfDoc = await pdfLib.PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);

    page.drawText('Incident Report', { x: 50, y: 750, size: 24, font });
    let y = 700;
    Object.entries(incident).forEach(([key, value]) => {
      page.drawText(`${key}: ${JSON.stringify(value)}`, { x: 50, y, size: 10, font });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    // Upload to Firebase Storage
    const fileName = `reports/incident_${incidentId}_${Date.now()}.pdf`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);
    await file.save(Buffer.from(pdfBytes), { contentType: 'application/pdf' });
    await file.makePublic();

    await logAuditActivity(auth.uid, 'INCIDENT_REPORT_DOWNLOADED', { incidentId });

    return { url: file.publicUrl(), success: true };
  } catch (err) {
    console.error('Error generating incident PDF:', err);
    throw new functions.https.HttpsError('internal', 'Failed to generate incident PDF');
  }
});

/**
 * Get all users (admin only, paginated)
 */
exports.getAllUsers = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { pageToken, pageSize = 50 } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can list all users
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const listUsersResult = await admin.auth().listUsers(pageSize, pageToken);
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      disabled: userRecord.disabled,
      metadata: userRecord.metadata,
      customClaims: userRecord.customClaims,
    }));

    await logAuditActivity(auth.uid, 'USERS_LIST_VIEWED', { count: users.length });

    return {
      users,
      nextPageToken: listUsersResult.pageToken || null,
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to list users');
  }
});

/**
 * Update user profile (authenticated user)
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate input
  const schema = Joi.object({
    profile: Joi.object({
      firstName: Joi.string().allow(''),
      lastName: Joi.string().allow(''),
      department: Joi.string().allow(''),
      position: Joi.string().allow(''),
      phone: Joi.string().allow(''),
      emergencyContact: Joi.object({
        name: Joi.string().allow(''),
        phone: Joi.string().allow(''),
        relationship: Joi.string().allow(''),
      }).optional(),
    }).required(),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        sms: Joi.boolean(),
      }).optional(),
      language: Joi.string().optional(),
      timezone: Joi.string().optional(),
    }).optional(),
  });

  const { error, value } = schema.validate(data);
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }

  try {
    const updateData = {
      ...(value.profile && { profile: value.profile }),
      ...(value.preferences && { preferences: value.preferences }),
      updatedAt: moment().toISOString(),
    };

    await db.collection('users').doc(auth.uid).update(updateData);

    await logAuditActivity(auth.uid, 'USER_PROFILE_UPDATED', { fields: Object.keys(updateData) });

    return { success: true };
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw new functions.https.HttpsError('internal', 'Failed to update user profile');
  }
});

/**
 * Deactivate user account (self or admin)
 */
exports.deactivateUserAccount = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // If no targetUserId, user is deactivating their own account
  const userToDeactivate = targetUserId || auth.uid;

  // Only admin/super_admin can deactivate others
  if (targetUserId && targetUserId !== auth.uid) {
    const userRole = await fetchUserRoleFromDb(auth.uid);
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }
  }

  try {
    await db.collection('users').doc(userToDeactivate).update({
      status: 'inactive',
      updatedAt: moment().toISOString(),
    });

    await logAuditActivity(auth.uid, 'USER_DEACTIVATED', { targetUserId: userToDeactivate });

    return { success: true };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to deactivate user');
  }
});

/**
 * Reactivate user account (self or admin)
 */
exports.reactivateUserAccount = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // If no targetUserId, user is reactivating their own account
  const userToReactivate = targetUserId || auth.uid;

  // Only admin/super_admin can reactivate others
  if (targetUserId && targetUserId !== auth.uid) {
    const userRole = await fetchUserRoleFromDb(auth.uid);
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }
  }

  try {
    await db.collection('users').doc(userToReactivate).update({
      status: 'active',
      updatedAt: moment().toISOString(),
    });

    await logAuditActivity(auth.uid, 'USER_REACTIVATED', { targetUserId: userToReactivate });

    return { success: true };
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reactivate user');
  }
});

/**
 * Lock user account (admin/super_admin only)
 */
exports.lockUserAccount = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can lock accounts
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Set status to locked in Firestore
    await db.collection('users').doc(targetUserId).update({
      status: 'locked',
      updatedAt: moment().toISOString(),
    });

    // Disable user in Firebase Auth
    await admin.auth().updateUser(targetUserId, { disabled: true });

    await logAuditActivity(auth.uid, 'USER_LOCKED', { targetUserId });

    return { success: true };
  } catch (error) {
    console.error('Error locking user account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to lock user account');
  }
});

/**
 * Unlock user account (admin/super_admin only)
 */
exports.unlockUserAccount = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can unlock accounts
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Set status to active in Firestore
    await db.collection('users').doc(targetUserId).update({
      status: 'active',
      updatedAt: moment().toISOString(),
    });

    // Enable user in Firebase Auth
    await admin.auth().updateUser(targetUserId, { disabled: false });

    await logAuditActivity(auth.uid, 'USER_UNLOCKED', { targetUserId });

    return { success: true };
  } catch (error) {
    console.error('Error unlocking user account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to unlock user account');
  }
});

/**
 * Soft-delete incident (role-aware)
 */
exports.deleteIncident = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { incidentId } = data;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate input
  const schema = Joi.object({
    incidentId: Joi.string().required(),
  });
  const { error } = schema.validate({ incidentId });
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }

  try {
    const incidentRef = db.collection('incidents').doc(incidentId);
    const incidentDoc = await incidentRef.get();
    if (!incidentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Incident not found');
    }
    const incident = incidentDoc.data();

    // Only allow if admin, manager, supervisor, or reporter
    const userRole = await fetchUserRoleFromDb(auth.uid);
    if (
      !['admin', 'super_admin', 'manager', 'supervisor'].includes(userRole) &&
      incident.reportedBy !== auth.uid
    ) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    await incidentRef.update({
      deleted: true,
      deletedAt: moment().toISOString(),
      deletedBy: auth.uid,
    });

    await logAuditActivity(auth.uid, 'INCIDENT_DELETED', { incidentId });

    return { success: true };
  } catch (err) {
    console.error('Error deleting incident:', err);
    throw new functions.https.HttpsError('internal', 'Failed to delete incident');
  }
});

/**
 * Export all users as CSV (admin/super_admin only)
 */
exports.exportAllUsersCSV = functions.https.onCall(async (data, context) => {
  const { auth } = context;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can export all users
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    // Fetch all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    // Prepare CSV
    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(users);

    // Upload to Firebase Storage
    const fileName = `exports/users_export_${Date.now()}.csv`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);
    await file.save(csv, { contentType: 'text/csv' });
    await file.makePublic();

    await logAuditActivity(auth.uid, 'USERS_EXPORTED_CSV', { count: users.length });

    return { url: file.publicUrl(), success: true };
  } catch (error) {
    console.error('Error exporting users as CSV:', error);
    throw new functions.https.HttpsError('internal', 'Failed to export users as CSV');
  }
});

/**
 * Reset user password (admin/super_admin only)
 */
exports.resetUserPassword = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId, newPassword } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can reset passwords
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId || !newPassword || newPassword.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId and a strong newPassword are required');
  }

  try {
    await admin.auth().updateUser(targetUserId, { password: newPassword });

    await logAuditActivity(auth.uid, 'USER_PASSWORD_RESET', { targetUserId });

    return { success: true };
  } catch (error) {
    console.error('Error resetting user password:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reset user password');
  }
});

/**
 * Force sign out user (admin/super_admin only)
 */
exports.forceSignOutUser = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can force sign out users
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(targetUserId);

    await logAuditActivity(auth.uid, 'USER_FORCE_SIGNOUT', { targetUserId });

    return { success: true };
  } catch (error) {
    console.error('Error forcing sign out:', error);
    throw new functions.https.HttpsError('internal', 'Failed to force sign out user');
  }
});

/**
 * Set custom user claims (admin/super_admin only)
 */
exports.setCustomUserClaims = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId, claims } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can set custom claims
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId || typeof claims !== 'object' || Array.isArray(claims)) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId and claims object are required');
  }

  try {
    await admin.auth().setCustomUserClaims(targetUserId, claims);

    await logAuditActivity(auth.uid, 'USER_CUSTOM_CLAIMS_SET', { targetUserId, claims });

    return { success: true };
  } catch (error) {
    console.error('Error setting custom user claims:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set custom user claims');
  }
});

/**
 * Permanently delete user account (admin/super_admin only)
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { targetUserId } = data || {};

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins and super_admins can delete users
  const userRole = await fetchUserRoleFromDb(auth.uid);
  if (!['admin', 'super_admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Delete user from Firebase Auth
    await admin.auth().deleteUser(targetUserId);

    // Delete user profile from Firestore
    await db.collection('users').doc(targetUserId).delete();

    // Optionally, you can also clean up or anonymize related data here

    await logAuditActivity(auth.uid, 'USER_DELETED', { targetUserId });

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete user account');
  }
});

/**
 * Check if user has required permission
 */
async function checkPermission(uid, requiredRole) {
  const userDoc = await db.collection('users').doc(uid).get();
  const userRole = userDoc.exists ? userDoc.data().role : 'user';
  const roleHierarchy = {
    super_admin: 5,
    admin: 4,
    manager: 3,
    supervisor: 2,
    user: 1,
  };
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

/**
 * Log audit activity
 */
async function logAuditActivity(uid, action, details) {
  try {
    await db.collection('audit_logs').add({
      userId: uid,
      action,
      details: details || {},
      timestamp: moment().toISOString(),
    });
  } catch (error) {
    console.error('Error logging audit activity:', error);
  }
}

/**
 * Calculate incident priority
 */
function calculatePriority(severity, category) {
  const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  const categoryWeight = { injury: 3, near_miss: 2, property_damage: 2, environmental: 2, security: 1 };
  const score = (severityWeight[severity] || 1) * (categoryWeight[category] || 1);
  if (score >= 12) return 'critical';
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/**
 * Create notification (stub)
 */
async function createNotification(options) {
  // You can implement this as needed, or leave as a stub for now
  return;
}