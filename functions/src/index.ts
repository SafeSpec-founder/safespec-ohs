import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import route handlers
import { authRoutes } from './routes/auth';
import { incidentRoutes } from './routes/incidents';
import { documentRoutes } from './routes/documents';
import { auditRoutes } from './routes/audits';
import { correctiveActionRoutes } from './routes/correctiveActions';
import { tenantRoutes } from './routes/tenants';
import { userRoutes } from './routes/users';
import { chatRoutes } from './routes/chat';
import { reportRoutes } from './routes/reports';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://safespec-ohs.web.app',
    'https://safespec-ohs.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SafeSpec OHS API'
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/incidents', incidentRoutes);
app.use('/documents', documentRoutes);
app.use('/audits', auditRoutes);
app.use('/corrective-actions', correctiveActionRoutes);
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);
app.use('/chat', chatRoutes);
app.use('/reports', reportRoutes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('API Error:', error);
  
  if (error.code === 'auth/id-token-expired') {
    res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
    return;
  }
  
  if (error.code === 'auth/argument-error') {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    return;
  }
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.region('us-central1').https.onRequest(app);

// Additional Cloud Functions for background tasks
export const processIncidentNotifications = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    const incidentId = context.params.incidentId;
    
    try {
      // Send notifications to relevant users
      const db = admin.firestore();
      const tenantDoc = await db.collection('tenants').doc(incident.tenantId).get();
      const tenant = tenantDoc.data();
      
      if (tenant) {
        // Get users who should be notified based on incident severity
        const usersQuery = await db.collection('users')
          .where('tenantId', '==', incident.tenantId)
          .where('role', 'in', ['admin', 'safety_manager'])
          .get();
        
        const notifications = usersQuery.docs.map(userDoc => ({
          userId: userDoc.id,
          type: 'incident_created',
          title: 'New Incident Reported',
          message: `A new ${incident.severity} incident has been reported: ${incident.title}`,
          data: {
            incidentId,
            severity: incident.severity,
            type: incident.type
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        }));
        
        // Batch write notifications
        const batch = db.batch();
        notifications.forEach(notification => {
          const notificationRef = db.collection('notifications').doc();
          batch.set(notificationRef, notification);
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error processing incident notifications:', error);
    }
  });

export const processAuditReminders = functions.pubsub
  .schedule('0 9 * * 1') // Every Monday at 9 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Find audits due in the next week
      const auditsQuery = await db.collection('audits')
        .where('status', '==', 'scheduled')
        .where('scheduledDate', '<=', nextWeek)
        .get();
      
      const notifications: any[] = [];
      
      for (const auditDoc of auditsQuery.docs) {
        const audit = auditDoc.data();
        
        // Get assigned auditors
        const auditorsQuery = await db.collection('users')
          .where('id', 'in', audit.assignedAuditors || [])
          .get();
        
        auditorsQuery.docs.forEach(auditorDoc => {
          notifications.push({
            userId: auditorDoc.id,
            type: 'audit_reminder',
            title: 'Upcoming Audit',
            message: `Audit "${audit.title}" is scheduled for ${new Date(audit.scheduledDate.toDate()).toLocaleDateString()}`,
            data: {
              auditId: auditDoc.id,
              scheduledDate: audit.scheduledDate
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          });
        });
      }
      
      // Batch write notifications
      if (notifications.length > 0) {
        const batch = db.batch();
        notifications.forEach(notification => {
          const notificationRef = db.collection('notifications').doc();
          batch.set(notificationRef, notification);
        });
        
        await batch.commit();
        console.log(`Sent ${notifications.length} audit reminders`);
      }
    } catch (error) {
      console.error('Error processing audit reminders:', error);
    }
  });

export const cleanupExpiredTokens = functions.pubsub
  .schedule('0 2 * * *') // Every day at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = new Date();
      
      // Clean up expired refresh tokens
      const expiredTokensQuery = await db.collection('refreshTokens')
        .where('expiresAt', '<', now)
        .get();
      
      if (!expiredTokensQuery.empty) {
        const batch = db.batch();
        expiredTokensQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Cleaned up ${expiredTokensQuery.docs.length} expired tokens`);
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  });

