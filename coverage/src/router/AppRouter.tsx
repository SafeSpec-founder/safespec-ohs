import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

// Layouts
import MainLayout from "@layouts/MainLayout";
import AuthLayout from "@layouts/AuthLayout";

// Auth Pages
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import ForgotPasswordPage from "@pages/ForgotPasswordPage";
import ResetPasswordPage from "@pages/ResetPasswordPage";

// Main Pages
import DashboardPage from "@pages/DashboardPage";
import IncidentsPage from "@pages/IncidentsPage";
import IncidentDetailsPage from "@pages/IncidentDetailsPage";
import IncidentFormPage from "@pages/IncidentFormPage";
import DocumentsPage from "@pages/DocumentsPage";
import DocumentDetailsPage from "@pages/DocumentDetailsPage";
import DocumentFormPage from "@pages/DocumentFormPage";
import CorrectiveActionsPage from "@pages/CorrectiveActionsPage";
import CorrectiveActionDetailsPage from "@pages/CorrectiveActionDetailsPage";
import CorrectiveActionFormPage from "@pages/CorrectiveActionFormPage";
import ReportsPage from "@pages/ReportsPage";
import ReportDetailsPage from "@pages/ReportDetailsPage";
import ReportFormPage from "@pages/ReportFormPage";
import UsersPage from "@pages/UsersPage";
import UserDetailsPage from "@pages/UserDetailsPage";
import UserFormPage from "@pages/UserFormPage";
import SettingsPage from "@pages/SettingsPage";
import NotificationsPage from "@pages/NotificationsPage";
import ProfilePage from "@pages/ProfilePage";
import HelpPage from "@pages/HelpPage";
import NotFoundPage from "@pages/NotFoundPage";
import UnauthorizedPage from "@pages/UnauthorizedPage";

// Route Guards
import ProtectedRoute from "@components/auth/ProtectedRoute";
import { PERMISSIONS } from "@utils/rolePermissions";

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Incidents */}
        <Route
          path="/incidents"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_INCIDENTS]}>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_INCIDENTS]}>
              <IncidentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.CREATE_INCIDENTS]}
            >
              <IncidentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.EDIT_INCIDENTS]}>
              <IncidentFormPage />
            </ProtectedRoute>
          }
        />

        {/* Documents */}
        <Route
          path="/documents"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
              <DocumentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/new"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.CREATE_DOCUMENTS]}
            >
              <DocumentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.EDIT_DOCUMENTS]}>
              <DocumentFormPage />
            </ProtectedRoute>
          }
        />

        {/* Corrective Actions */}
        <Route
          path="/corrective-actions"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.VIEW_CORRECTIVE_ACTIONS]}
            >
              <CorrectiveActionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corrective-actions/:id"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.VIEW_CORRECTIVE_ACTIONS]}
            >
              <CorrectiveActionDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corrective-actions/new"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.CREATE_CORRECTIVE_ACTIONS]}
            >
              <CorrectiveActionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corrective-actions/:id/edit"
          element={
            <ProtectedRoute
              requiredPermissions={[PERMISSIONS.EDIT_CORRECTIVE_ACTIONS]}
            >
              <CorrectiveActionFormPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <ReportDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CREATE_REPORTS]}>
              <ReportFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CREATE_REPORTS]}>
              <ReportFormPage />
            </ProtectedRoute>
          }
        />

        {/* Users - Admin/Manager Only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.MANAGE_USERS]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_USERS]}>
              <UserDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CREATE_USERS]}>
              <UserFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.EDIT_USERS]}>
              <UserFormPage />
            </ProtectedRoute>
          }
        />

        {/* Settings - Admin Only */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.MANAGE_SETTINGS]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Other Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
