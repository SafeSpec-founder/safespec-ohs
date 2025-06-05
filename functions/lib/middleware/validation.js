"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];
        // Validate body
        if (schema.body) {
            const { error } = schema.body.validate(req.body);
            if (error) {
                errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
            }
        }
        // Validate params
        if (schema.params) {
            const { error } = schema.params.validate(req.params);
            if (error) {
                errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
            }
        }
        // Validate query
        if (schema.query) {
            const { error } = schema.query.validate(req.query);
            if (error) {
                errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
            }
        }
        if (errors.length > 0) {
            res.status(400).json({
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
// Common validation schemas
exports.schemas = {
    // ID parameter validation
    idParam: {
        params: joi_1.default.object({
            id: joi_1.default.string().required()
        })
    },
    // Pagination validation
    pagination: {
        query: joi_1.default.object({
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(100).default(20),
            sortBy: joi_1.default.string().default('createdAt'),
            sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
            search: joi_1.default.string().optional(),
            status: joi_1.default.string().optional(),
            type: joi_1.default.string().optional(),
            severity: joi_1.default.string().optional(),
            priority: joi_1.default.string().optional(),
            department: joi_1.default.string().optional(),
            role: joi_1.default.string().optional(),
            isActive: joi_1.default.boolean().optional()
        })
    },
    // User registration validation
    register: {
        body: joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(8).required(),
            firstName: joi_1.default.string().required(),
            lastName: joi_1.default.string().required(),
            role: joi_1.default.string().valid('admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer', 'guest').default('employee'),
            department: joi_1.default.string().optional(),
            position: joi_1.default.string().optional(),
            phone: joi_1.default.string().optional()
        })
    },
    // Login validation
    login: {
        body: joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required()
        })
    },
    // Incident creation validation
    incident: {
        body: joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            type: joi_1.default.string().valid('accident', 'near_miss', 'hazard', 'environmental', 'security', 'quality', 'other').required(),
            severity: joi_1.default.string().valid('low', 'medium', 'high', 'critical').required(),
            location: joi_1.default.string().required(),
            dateOccurred: joi_1.default.date().required(),
            timeOccurred: joi_1.default.string().optional(),
            witnesses: joi_1.default.array().items(joi_1.default.string()).optional(),
            injuryDetails: joi_1.default.object().optional(),
            environmentalImpact: joi_1.default.object().optional(),
            immediateActions: joi_1.default.string().optional(),
            attachments: joi_1.default.array().items(joi_1.default.string()).optional()
        })
    },
    // Document creation validation
    document: {
        body: joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            type: joi_1.default.string().valid('policy', 'procedure', 'form', 'manual', 'certificate', 'report', 'other').required(),
            category: joi_1.default.string().optional(),
            accessLevel: joi_1.default.string().valid('public', 'internal', 'restricted', 'confidential').default('internal'),
            tags: joi_1.default.array().items(joi_1.default.string()).optional(),
            expiryDate: joi_1.default.date().optional(),
            version: joi_1.default.string().default('1.0')
        })
    },
    // Audit creation validation
    audit: {
        body: joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            type: joi_1.default.string().valid('internal', 'external', 'regulatory', 'compliance', 'safety', 'environmental', 'quality').required(),
            scope: joi_1.default.string().required(),
            scheduledDate: joi_1.default.date().required(),
            assignedAuditors: joi_1.default.array().items(joi_1.default.string()).required(),
            checklist: joi_1.default.array().items(joi_1.default.object()).optional(),
            criteria: joi_1.default.array().items(joi_1.default.string()).optional()
        })
    },
    // Corrective action creation validation
    correctiveAction: {
        body: joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            type: joi_1.default.string().valid('corrective', 'preventive', 'improvement').required(),
            priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical').required(),
            assignedTo: joi_1.default.string().required(),
            dueDate: joi_1.default.date().required(),
            sourceType: joi_1.default.string().valid('incident', 'audit', 'inspection', 'complaint', 'suggestion', 'other').optional(),
            sourceId: joi_1.default.string().optional(),
            rootCause: joi_1.default.string().optional(),
            proposedSolution: joi_1.default.string().optional()
        })
    }
};
//# sourceMappingURL=validation.js.map