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
exports.documentRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
exports.documentRoutes = router;
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Get all documents with filtering and pagination
router.get('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.read'), (0, validation_1.validateRequest)(validation_1.schemas.pagination), async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, type, category, accessLevel } = req.query;
        const db = admin.firestore();
        let query = db.collection('documents')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        // Apply filters
        if (type) {
            query = query.where('type', '==', type);
        }
        if (category) {
            query = query.where('category', '==', category);
        }
        if (accessLevel) {
            query = query.where('accessLevel', '==', accessLevel);
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
        const totalQuery = db.collection('documents')
            .where('tenantId', '==', req.user.tenantId)
            .where('isDeleted', '!=', true);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        const documents = snapshot.docs.map(doc => {
            var _a, _b, _c;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), expiryDate: (_c = doc.data().expiryDate) === null || _c === void 0 ? void 0 : _c.toDate() }));
        });
        // Apply text search if provided
        let filteredDocuments = documents;
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredDocuments = documents.filter((doc) => {
                var _a, _b;
                return doc.title.toLowerCase().includes(searchTerm) ||
                    ((_a = doc.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    ((_b = doc.tags) === null || _b === void 0 ? void 0 : _b.some((tag) => tag.toLowerCase().includes(searchTerm)));
            });
        }
        res.json({
            documents: filteredDocuments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            error: 'Failed to get documents',
            code: 'GET_DOCUMENTS_FAILED',
            details: error.message
        });
    }
});
// Get document by ID
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const documentDoc = await db.collection('documents').doc(id).get();
        if (!documentDoc.exists) {
            res.status(404).json({
                error: 'Document not found',
                code: 'DOCUMENT_NOT_FOUND'
            });
            return;
        }
        const documentData = documentDoc.data();
        // Check tenant access
        if (documentData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Check access level permissions
        if (!hasDocumentAccess(documentData.accessLevel, req.user.role)) {
            res.status(403).json({
                error: 'Insufficient access level',
                code: 'INSUFFICIENT_ACCESS_LEVEL'
            });
            return;
        }
        // Log document access
        await db.collection('documentAccess').add({
            documentId: id,
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            accessedAt: admin.firestore.FieldValue.serverTimestamp(),
            action: 'viewed'
        });
        res.json(Object.assign(Object.assign({ id: documentDoc.id }, documentData), { createdAt: (_a = documentData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = documentData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), expiryDate: (_c = documentData.expiryDate) === null || _c === void 0 ? void 0 : _c.toDate() }));
    }
    catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            error: 'Failed to get document',
            code: 'GET_DOCUMENT_FAILED',
            details: error.message
        });
    }
});
// Create new document
router.post('/', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.create'), upload.single('file'), (0, validation_1.validateRequest)(validation_1.schemas.document), async (req, res) => {
    try {
        const file = req.file;
        let fileUrl = null;
        let fileName = null;
        let fileSize = null;
        let mimeType = null;
        // Upload file to Firebase Storage if provided
        if (file) {
            const bucket = admin.storage().bucket();
            const fileId = (0, uuid_1.v4)();
            const fileExtension = file.originalname.split('.').pop();
            fileName = `${fileId}.${fileExtension}`;
            const filePath = `documents/${req.user.tenantId}/${fileName}`;
            const fileUpload = bucket.file(filePath);
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        uploadedBy: req.user.uid,
                        originalName: file.originalname
                    }
                }
            });
            await new Promise((resolve, reject) => {
                stream.on('error', reject);
                stream.on('finish', resolve);
                stream.end(file.buffer);
            });
            // Make file publicly readable if access level is public
            if (req.body.accessLevel === 'public') {
                await fileUpload.makePublic();
            }
            fileUrl = `gs://${bucket.name}/${filePath}`;
            fileSize = file.size;
            mimeType = file.mimetype;
        }
        const documentData = Object.assign(Object.assign({}, req.body), { tenantId: req.user.tenantId, createdBy: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), fileUrl, fileName: (file === null || file === void 0 ? void 0 : file.originalname) || null, fileSize,
            mimeType, downloadCount: 0, isDeleted: false, version: req.body.version || '1.0' });
        // Convert date fields
        if (req.body.expiryDate) {
            documentData.expiryDate = new Date(req.body.expiryDate);
        }
        const db = admin.firestore();
        const documentRef = await db.collection('documents').add(documentData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'document',
            entityId: documentRef.id,
            action: 'created',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: documentData.title,
                type: documentData.type,
                category: documentData.category
            }
        });
        res.status(201).json({
            id: documentRef.id,
            message: 'Document created successfully'
        });
    }
    catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({
            error: 'Failed to create document',
            code: 'CREATE_DOCUMENT_FAILED',
            details: error.message
        });
    }
});
// Update document
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.update'), upload.single('file'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const documentDoc = await db.collection('documents').doc(id).get();
        if (!documentDoc.exists) {
            res.status(404).json({
                error: 'Document not found',
                code: 'DOCUMENT_NOT_FOUND'
            });
            return;
        }
        const existingData = documentDoc.data();
        // Check tenant access
        if (existingData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastModifiedBy: req.user.uid });
        // Handle file upload if provided
        const file = req.file;
        if (file) {
            const bucket = admin.storage().bucket();
            const fileId = (0, uuid_1.v4)();
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${fileId}.${fileExtension}`;
            const filePath = `documents/${req.user.tenantId}/${fileName}`;
            const fileUpload = bucket.file(filePath);
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        uploadedBy: req.user.uid,
                        originalName: file.originalname
                    }
                }
            });
            await new Promise((resolve, reject) => {
                stream.on('error', reject);
                stream.on('finish', resolve);
                stream.end(file.buffer);
            });
            updateData.fileUrl = `gs://${bucket.name}/${filePath}`;
            updateData.fileName = file.originalname;
            updateData.fileSize = file.size;
            updateData.mimeType = file.mimetype;
            // Delete old file if it exists
            if (existingData.fileUrl) {
                try {
                    const oldFile = bucket.file(existingData.fileUrl.replace(`gs://${bucket.name}/`, ''));
                    await oldFile.delete();
                }
                catch (deleteError) {
                    console.warn('Failed to delete old file:', deleteError);
                }
            }
        }
        // Convert date fields
        if (req.body.expiryDate) {
            updateData.expiryDate = new Date(req.body.expiryDate);
        }
        await documentDoc.ref.update(updateData);
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'document',
            entityId: id,
            action: 'updated',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                changes: Object.keys(req.body),
                fileUpdated: !!file
            }
        });
        res.json({ message: 'Document updated successfully' });
    }
    catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({
            error: 'Failed to update document',
            code: 'UPDATE_DOCUMENT_FAILED',
            details: error.message
        });
    }
});
// Delete document
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.delete'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const documentDoc = await db.collection('documents').doc(id).get();
        if (!documentDoc.exists) {
            res.status(404).json({
                error: 'Document not found',
                code: 'DOCUMENT_NOT_FOUND'
            });
            return;
        }
        const documentData = documentDoc.data();
        // Check tenant access
        if (documentData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Soft delete
        await documentDoc.ref.update({
            isDeleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
            deletedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create activity log entry
        await db.collection('activityLogs').add({
            entityType: 'document',
            entityId: id,
            action: 'deleted',
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                title: documentData.title,
                type: documentData.type
            }
        });
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            error: 'Failed to delete document',
            code: 'DELETE_DOCUMENT_FAILED',
            details: error.message
        });
    }
});
// Download document
router.get('/:id/download', auth_1.authenticateToken, (0, auth_1.requirePermission)('documents.read'), (0, validation_1.validateRequest)(validation_1.schemas.idParam), async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        const documentDoc = await db.collection('documents').doc(id).get();
        if (!documentDoc.exists) {
            res.status(404).json({
                error: 'Document not found',
                code: 'DOCUMENT_NOT_FOUND'
            });
            return;
        }
        const documentData = documentDoc.data();
        // Check tenant access
        if (documentData.tenantId !== req.user.tenantId && req.user.role !== 'super_admin') {
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED'
            });
            return;
        }
        // Check access level permissions
        if (!hasDocumentAccess(documentData.accessLevel, req.user.role)) {
            res.status(403).json({
                error: 'Insufficient access level',
                code: 'INSUFFICIENT_ACCESS_LEVEL'
            });
            return;
        }
        if (!documentData.fileUrl) {
            res.status(404).json({
                error: 'File not found',
                code: 'FILE_NOT_FOUND'
            });
            return;
        }
        // Generate signed URL for download
        const bucket = admin.storage().bucket();
        const file = bucket.file(documentData.fileUrl.replace(`gs://${bucket.name}/`, ''));
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        // Increment download count
        await documentDoc.ref.update({
            downloadCount: admin.firestore.FieldValue.increment(1)
        });
        // Log document access
        await db.collection('documentAccess').add({
            documentId: id,
            userId: req.user.uid,
            tenantId: req.user.tenantId,
            accessedAt: admin.firestore.FieldValue.serverTimestamp(),
            action: 'downloaded'
        });
        res.json({
            downloadUrl: signedUrl,
            fileName: documentData.fileName,
            fileSize: documentData.fileSize
        });
    }
    catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            error: 'Failed to download document',
            code: 'DOWNLOAD_DOCUMENT_FAILED',
            details: error.message
        });
    }
});
// Helper function to check document access based on access level and user role
function hasDocumentAccess(accessLevel, userRole) {
    var _a;
    const accessMatrix = {
        public: ['admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer', 'guest'],
        internal: ['admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer'],
        restricted: ['admin', 'safety_manager', 'supervisor', 'auditor'],
        confidential: ['admin', 'safety_manager']
    };
    return ((_a = accessMatrix[accessLevel]) === null || _a === void 0 ? void 0 : _a.includes(userRole)) || false;
}
//# sourceMappingURL=documents.js.map