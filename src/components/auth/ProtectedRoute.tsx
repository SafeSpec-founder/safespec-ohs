import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * @param children - Child components to render if authorized
 * @param requiredRole - Required user role to access the route
 * @param requiredPermissions - Required permissions to access the route
 * @param fallbackPath - Path to redirect to if not authorized
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, loading } = useAuth(); // Include loading state
  const location = useLocation();

  if (loading) {
    // Prevent premature redirects while auth state is loading
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Safely get userRole and userPermissions
  const userRole = (user && (user as any).role) || "";
  const userPermissions = (user && (user as any).permissions) || [];

  // Role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole =
      typeof userRole === "string"
        ? roles.includes(userRole)
        : Array.isArray(userRole)
          ? roles.every((role) => userRole.includes(role))
          : false;

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Permissions check
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = Array.isArray(userPermissions)
      ? requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
        )
      : false;

    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Only allow access for defined roles
  if (
    !["super_admin", "admin", "safety_manager", "employee"].includes(userRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
