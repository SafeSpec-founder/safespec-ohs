/**
 * Role and Permission Management for SafeSpec OHS Application
 * Defines all roles, permissions, and access control logic
 */

// Define all available permissions in the system
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",

  // Incident Management
  MANAGE_INCIDENTS: "manage_incidents",
  VIEW_INCIDENTS: "view_incidents",
  CREATE_INCIDENTS: "create_incidents",
  EDIT_INCIDENTS: "edit_incidents",
  DELETE_INCIDENTS: "delete_incidents",
  APPROVE_INCIDENTS: "approve_incidents",

  // Document Management
  MANAGE_DOCUMENTS: "manage_documents",
  VIEW_DOCUMENTS: "view_documents",
  CREATE_DOCUMENTS: "create_documents",
  EDIT_DOCUMENTS: "edit_documents",
  DELETE_DOCUMENTS: "delete_documents",
  APPROVE_DOCUMENTS: "approve_documents",
  PUBLISH_DOCUMENTS: "publish_documents",

  // Audit Management
  MANAGE_AUDITS: "manage_audits",
  VIEW_AUDITS: "view_audits",
  CREATE_AUDITS: "create_audits",
  EDIT_AUDITS: "edit_audits",
  DELETE_AUDITS: "delete_audits",
  CONDUCT_AUDITS: "conduct_audits",

  // Corrective Actions
  MANAGE_CORRECTIVE_ACTIONS: "manage_corrective_actions",
  VIEW_CORRECTIVE_ACTIONS: "view_corrective_actions",
  CREATE_CORRECTIVE_ACTIONS: "create_corrective_actions",
  EDIT_CORRECTIVE_ACTIONS: "edit_corrective_actions",
  DELETE_CORRECTIVE_ACTIONS: "delete_corrective_actions",
  APPROVE_CORRECTIVE_ACTIONS: "approve_corrective_actions",

  // Reporting
  VIEW_REPORTS: "view_reports",
  CREATE_REPORTS: "create_reports",
  EXPORT_REPORTS: "export_reports",
  VIEW_ANALYTICS: "view_analytics",

  // System Administration
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_TENANTS: "manage_tenants",
  VIEW_SYSTEM_LOGS: "view_system_logs",
  MANAGE_INTEGRATIONS: "manage_integrations",

  // AI Features
  USE_AI_ASSISTANT: "use_ai_assistant",
  MANAGE_AI_SETTINGS: "manage_ai_settings",
} as const;

// Define all available roles in the system
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SAFETY_MANAGER: "safety_manager",
  EMPLOYEE: "employee",
} as const;

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_INCIDENTS,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.CREATE_INCIDENTS,
    PERMISSIONS.EDIT_INCIDENTS,
    PERMISSIONS.DELETE_INCIDENTS,
    PERMISSIONS.APPROVE_INCIDENTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.CREATE_DOCUMENTS,
    PERMISSIONS.EDIT_DOCUMENTS,
    PERMISSIONS.DELETE_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.PUBLISH_DOCUMENTS,
    PERMISSIONS.MANAGE_AUDITS,
    PERMISSIONS.VIEW_AUDITS,
    PERMISSIONS.CREATE_AUDITS,
    PERMISSIONS.EDIT_AUDITS,
    PERMISSIONS.DELETE_AUDITS,
    PERMISSIONS.CONDUCT_AUDITS,
    PERMISSIONS.MANAGE_CORRECTIVE_ACTIONS,
    PERMISSIONS.VIEW_CORRECTIVE_ACTIONS,
    PERMISSIONS.CREATE_CORRECTIVE_ACTIONS,
    PERMISSIONS.EDIT_CORRECTIVE_ACTIONS,
    PERMISSIONS.DELETE_CORRECTIVE_ACTIONS,
    PERMISSIONS.APPROVE_CORRECTIVE_ACTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.USE_AI_ASSISTANT,
    PERMISSIONS.MANAGE_AI_SETTINGS,
  ],

  [ROLES.SAFETY_MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_INCIDENTS,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.CREATE_INCIDENTS,
    PERMISSIONS.EDIT_INCIDENTS,
    PERMISSIONS.APPROVE_INCIDENTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.CREATE_DOCUMENTS,
    PERMISSIONS.EDIT_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.PUBLISH_DOCUMENTS,
    PERMISSIONS.MANAGE_AUDITS,
    PERMISSIONS.VIEW_AUDITS,
    PERMISSIONS.CREATE_AUDITS,
    PERMISSIONS.EDIT_AUDITS,
    PERMISSIONS.CONDUCT_AUDITS,
    PERMISSIONS.MANAGE_CORRECTIVE_ACTIONS,
    PERMISSIONS.VIEW_CORRECTIVE_ACTIONS,
    PERMISSIONS.CREATE_CORRECTIVE_ACTIONS,
    PERMISSIONS.EDIT_CORRECTIVE_ACTIONS,
    PERMISSIONS.APPROVE_CORRECTIVE_ACTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.USE_AI_ASSISTANT,
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.CREATE_INCIDENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_CORRECTIVE_ACTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.USE_AI_ASSISTANT,
  ],
};

/**
 * Check if a user has a specific permission
 * @param userPermissions - Array of user's permissions
 * @param permission - Permission to check
 * @returns Boolean indicating if user has the permission
 */
export const hasPermission = (
  userPermissions: string[],
  permission: string,
): boolean => {
  return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param userPermissions - Array of user's permissions
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has any of the permissions
 */
export const hasAnyPermission = (
  userPermissions: string[],
  permissions: string[],
): boolean => {
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param userPermissions - Array of user's permissions
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has all of the permissions
 */
export const hasAllPermissions = (
  userPermissions: string[],
  permissions: string[],
): boolean => {
  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

/**
 * Get all permissions for a specific role
 * @param role - Role to get permissions for
 * @returns Array of permissions for the role
 */
export const getPermissionsForRole = (role: string): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 * @param role - Role to check
 * @param permission - Permission to check
 * @returns Boolean indicating if role has the permission
 */
export const roleHasPermission = (
  role: string,
  permission: string,
): boolean => {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};

/**
 * Get user's effective permissions (combines role permissions with individual permissions)
 * @param userRole - User's role
 * @param userPermissions - User's individual permissions
 * @returns Array of all effective permissions
 */
export const getEffectivePermissions = (
  userRole: string,
  userPermissions: string[] = [],
): string[] => {
  const rolePermissions = getPermissionsForRole(userRole);
  const allPermissions = [...rolePermissions, ...userPermissions];
  return [...new Set(allPermissions)]; // Remove duplicates
};

/**
 * Check if a user can access a specific route based on role and permissions
 * @param userRole - User's role
 * @param userPermissions - User's permissions
 * @param requiredRole - Required role for the route
 * @param requiredPermissions - Required permissions for the route
 * @returns Boolean indicating if user can access the route
 */
export const canAccessRoute = (
  userRole: string,
  userPermissions: string[],
  requiredRole?: string,
  requiredPermissions: string[] = [],
): boolean => {
  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    return false;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const effectivePermissions = getEffectivePermissions(
      userRole,
      userPermissions,
    );
    return hasAllPermissions(effectivePermissions, requiredPermissions);
  }

  return true;
};
