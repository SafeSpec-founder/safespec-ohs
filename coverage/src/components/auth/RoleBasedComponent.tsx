import React from "react";
import { useAuth } from "@contexts/AuthContext";

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
}

/**
 * RoleBasedComponent that conditionally renders content based on user roles and permissions
 * @param children - Content to render if user has required access
 * @param allowedRoles - Array of roles that can access this content
 * @param requiredPermissions - Array of permissions required to access this content
 * @param fallback - Content to render if user doesn't have access
 * @param requireAll - Whether user needs ALL permissions (true) or ANY permission (false)
 */
const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  requireAll = true,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything or show fallback
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check role access
  const hasRoleAccess =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // Check permission access
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0 && user.permissions) {
    if (requireAll) {
      // User must have ALL required permissions
      hasPermissionAccess = requiredPermissions.every((permission) =>
        user.permissions?.includes(permission),
      );
    } else {
      // User must have at least ONE of the required permissions
      hasPermissionAccess = requiredPermissions.some((permission) =>
        user.permissions?.includes(permission),
      );
    }
  } else if (requiredPermissions.length > 0) {
    // If permissions are required but user has none, deny access
    hasPermissionAccess = false;
  }

  // Render children if user has both role and permission access
  if (hasRoleAccess && hasPermissionAccess) {
    return <>{children}</>;
  }

  // Render fallback if user doesn't have access
  return <>{fallback}</>;
};

export default RoleBasedComponent;
