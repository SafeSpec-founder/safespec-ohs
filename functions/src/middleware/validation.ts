import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

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

// Common validation schemas
export const schemas = {
  // ID parameter validation
  idParam: {
    params: Joi.object({
      id: Joi.string().required()
    })
  },

  // Pagination validation
  pagination: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string().default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      search: Joi.string().optional(),
      status: Joi.string().optional(),
      type: Joi.string().optional(),
      severity: Joi.string().optional(),
      priority: Joi.string().optional(),
      department: Joi.string().optional(),
      role: Joi.string().optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // User registration validation
  register: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      role: Joi.string().valid('admin', 'safety_manager', 'supervisor', 'employee', 'auditor', 'contractor', 'viewer', 'guest').default('employee'),
      department: Joi.string().optional(),
      position: Joi.string().optional(),
      phone: Joi.string().optional()
    })
  },

  // Login validation
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },

  // Incident creation validation
  incident: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      type: Joi.string().valid('accident', 'near_miss', 'hazard', 'environmental', 'security', 'quality', 'other').required(),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      location: Joi.string().required(),
      dateOccurred: Joi.date().required(),
      timeOccurred: Joi.string().optional(),
      witnesses: Joi.array().items(Joi.string()).optional(),
      injuryDetails: Joi.object().optional(),
      environmentalImpact: Joi.object().optional(),
      immediateActions: Joi.string().optional(),
      attachments: Joi.array().items(Joi.string()).optional()
    })
  },

  // Document creation validation
  document: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      type: Joi.string().valid('policy', 'procedure', 'form', 'manual', 'certificate', 'report', 'other').required(),
      category: Joi.string().optional(),
      accessLevel: Joi.string().valid('public', 'internal', 'restricted', 'confidential').default('internal'),
      tags: Joi.array().items(Joi.string()).optional(),
      expiryDate: Joi.date().optional(),
      version: Joi.string().default('1.0')
    })
  },

  // Audit creation validation
  audit: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      type: Joi.string().valid('internal', 'external', 'regulatory', 'compliance', 'safety', 'environmental', 'quality').required(),
      scope: Joi.string().required(),
      scheduledDate: Joi.date().required(),
      assignedAuditors: Joi.array().items(Joi.string()).required(),
      checklist: Joi.array().items(Joi.object()).optional(),
      criteria: Joi.array().items(Joi.string()).optional()
    })
  },

  // Corrective action creation validation
  correctiveAction: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      type: Joi.string().valid('corrective', 'preventive', 'improvement').required(),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      assignedTo: Joi.string().required(),
      dueDate: Joi.date().required(),
      sourceType: Joi.string().valid('incident', 'audit', 'inspection', 'complaint', 'suggestion', 'other').optional(),
      sourceId: Joi.string().optional(),
      rootCause: Joi.string().optional(),
      proposedSolution: Joi.string().optional()
    })
  }
};

