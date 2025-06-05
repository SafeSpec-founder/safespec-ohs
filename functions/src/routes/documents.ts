import { Router } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all documents with filtering and pagination
router.get('/',
  authenticateToken,
  requirePermission('documents.read'),
  validateRequest(schemas.pagination),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        type,
        category,
        accessLevel
      } = req.query;

      const db = admin.firestore();
      let query = db.collection('documents')
        .where('tenantId', '==', req.user!.tenantId)
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
      const totalQuery = db.collection('documents')
        .where('tenantId', '==', req.user!.tenantId)
        .where('isDeleted', '!=', true);
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate()
      }));

      // Apply text search if provided
      let filteredDocuments = documents;
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredDocuments = documents.filter((doc: any) =>
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description?.toLowerCase().includes(searchTerm) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
        );
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
    } catch (error: any) {
      console.error('Get documents error:', error);
      res.status(500).json({
        error: 'Failed to get documents',
        code: 'GET_DOCUMENTS_FAILED',
        details: error.message
      });
    }
  }
);

// Get document by ID
router.get('/:id',
  authenticateToken,
  requirePermission('documents.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const documentData = documentDoc.data()!;
      
      // Check tenant access
      if (documentData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Check access level permissions
      if (!hasDocumentAccess(documentData.accessLevel, req.user!.role)) {
        res.status(403).json({
          error: 'Insufficient access level',
          code: 'INSUFFICIENT_ACCESS_LEVEL'
        });
        return;
      }

      // Log document access
      await db.collection('documentAccess').add({
        documentId: id,
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        accessedAt: admin.firestore.FieldValue.serverTimestamp(),
        action: 'viewed'
      });

      res.json({
        id: documentDoc.id,
        ...documentData,
        createdAt: documentData.createdAt?.toDate(),
        updatedAt: documentData.updatedAt?.toDate(),
        expiryDate: documentData.expiryDate?.toDate()
      });
    } catch (error: any) {
      console.error('Get document error:', error);
      res.status(500).json({
        error: 'Failed to get document',
        code: 'GET_DOCUMENT_FAILED',
        details: error.message
      });
    }
  }
);

// Create new document
router.post('/',
  authenticateToken,
  requirePermission('documents.create'),
  upload.single('file'),
  validateRequest(schemas.document),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const file = req.file;
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      // Upload file to Firebase Storage if provided
      if (file) {
        const bucket = admin.storage().bucket();
        const fileId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        fileName = `${fileId}.${fileExtension}`;
        const filePath = `documents/${req.user!.tenantId}/${fileName}`;
        
        const fileUpload = bucket.file(filePath);
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              uploadedBy: req.user!.uid,
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

      const documentData = {
        ...req.body,
        tenantId: req.user!.tenantId,
        createdBy: req.user!.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        fileUrl,
        fileName: file?.originalname || null,
        fileSize,
        mimeType,
        downloadCount: 0,
        isDeleted: false,
        version: req.body.version || '1.0'
      };

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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
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
    } catch (error: any) {
      console.error('Create document error:', error);
      res.status(500).json({
        error: 'Failed to create document',
        code: 'CREATE_DOCUMENT_FAILED',
        details: error.message
      });
    }
  }
);

// Update document
router.put('/:id',
  authenticateToken,
  requirePermission('documents.update'),
  upload.single('file'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const existingData = documentDoc.data()!;
      
      // Check tenant access
      if (existingData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      const updateData: any = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.user!.uid
      };

      // Handle file upload if provided
      const file = req.file;
      if (file) {
        const bucket = admin.storage().bucket();
        const fileId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${fileId}.${fileExtension}`;
        const filePath = `documents/${req.user!.tenantId}/${fileName}`;
        
        const fileUpload = bucket.file(filePath);
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              uploadedBy: req.user!.uid,
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
          } catch (deleteError) {
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          changes: Object.keys(req.body),
          fileUpdated: !!file
        }
      });

      res.json({ message: 'Document updated successfully' });
    } catch (error: any) {
      console.error('Update document error:', error);
      res.status(500).json({
        error: 'Failed to update document',
        code: 'UPDATE_DOCUMENT_FAILED',
        details: error.message
      });
    }
  }
);

// Delete document
router.delete('/:id',
  authenticateToken,
  requirePermission('documents.delete'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const documentData = documentDoc.data()!;
      
      // Check tenant access
      if (documentData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
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
        deletedBy: req.user!.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create activity log entry
      await db.collection('activityLogs').add({
        entityType: 'document',
        entityId: id,
        action: 'deleted',
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title: documentData.title,
          type: documentData.type
        }
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
      console.error('Delete document error:', error);
      res.status(500).json({
        error: 'Failed to delete document',
        code: 'DELETE_DOCUMENT_FAILED',
        details: error.message
      });
    }
  }
);

// Download document
router.get('/:id/download',
  authenticateToken,
  requirePermission('documents.read'),
  validateRequest(schemas.idParam),
  async (req: AuthenticatedRequest, res): Promise<void> => {
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

      const documentData = documentDoc.data()!;
      
      // Check tenant access
      if (documentData.tenantId !== req.user!.tenantId && req.user!.role !== 'super_admin') {
        res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Check access level permissions
      if (!hasDocumentAccess(documentData.accessLevel, req.user!.role)) {
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
        userId: req.user!.uid,
        tenantId: req.user!.tenantId,
        accessedAt: admin.firestore.FieldValue.serverTimestamp(),
        action: 'downloaded'
      });

      res.json({
        downloadUrl: signedUrl,
        fileName: documentData.fileName,
        fileSize: documentData.fileSize
      });
    } catch (error: any) {
      console.error('Download document error:', error);
      res.status(500).json({
        error: 'Failed to download document',
        code: 'DOWNLOAD_DOCUMENT_FAILED',
        details: error.message
      });
    }
  }
);

// Helper function to check document access based on access level and user role
function hasDocumentAccess(accessLevel: string, userRole: string): boolean {
  const accessMatrix: { [key: string]: string[] } = {
    public: ['admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer', 'guest'],
    internal: ['admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer'],
    restricted: ['admin', 'safety_manager', 'supervisor', 'auditor'],
    confidential: ['admin', 'safety_manager']
  };

  return accessMatrix[accessLevel]?.includes(userRole) || false;
}

export { router as documentRoutes };

