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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredTokens = exports.processAuditReminders = exports.processIncidentNotifications = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Import route handlers
const auth_1 = require("./routes/auth");
const incidents_1 = require("./routes/incidents");
const documents_1 = require("./routes/documents");
const audits_1 = require("./routes/audits");
const correctiveActions_1 = require("./routes/correctiveActions");
const tenants_1 = require("./routes/tenants");
const users_1 = require("./routes/users");
const chat_1 = require("./routes/chat");
const reports_1 = require("./routes/reports");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/auth', auth_1.authRoutes);
app.use('/incidents', incidents_1.incidentRoutes);
app.use('/documents', documents_1.documentRoutes);
app.use('/audits', audits_1.auditRoutes);
app.use('/corrective-actions', correctiveActions_1.correctiveActionRoutes);
app.use('/tenants', tenants_1.tenantRoutes);
app.use('/users', users_1.userRoutes);
app.use('/chat', chat_1.chatRoutes);
app.use('/reports', reports_1.reportRoutes);
// Error handling middleware
app.use((error, req, res, next) => {
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
    res.status(error.status || 500).json(Object.assign({ error: error.message || 'Internal server error', code: error.code || 'INTERNAL_ERROR' }, (process.env.NODE_ENV === 'development' && { stack: error.stack })));
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
exports.api = functions.region('us-central1').https.onRequest(app);
// Additional Cloud Functions for background tasks
exports.processIncidentNotifications = functions.firestore
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
    }
    catch (error) {
        console.error('Error processing incident notifications:', error);
    }
});
exports.processAuditReminders = functions.pubsub
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
        const notifications = [];
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
    }
    catch (error) {
        console.error('Error processing audit reminders:', error);
    }
});
exports.cleanupExpiredTokens = functions.pubsub
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
    }
    catch (error) {
        console.error('Error cleaning up expired tokens:', error);
    }
});
//# sourceMappingURL=index.js.map