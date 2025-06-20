/**
 * AppUser interface for SafeSpec OHS Application
 * Used for authentication and user management
 */

export interface AppUser {
  id: string;
  uid: string; // Firebase user ID
  email: string;
  displayName: string;
  role: string;
  tenantId?: string;
  permissions?: string[];
  department?: string;
  position?: string;
  avatar?: string;
  photoURL?: string; // Added for compatibility with Header component
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  phoneNumber?: string;
  settings?: {
    notifications?: boolean;
    theme?: "light" | "dark" | "system";
    language?: string;
  };
}

export interface AppUserUpdate {
  email?: string;
  displayName?: string;
  role?: string;
  permissions?: string[];
  department?: string;
  position?: string;
  avatar?: string;
  phoneNumber?: string;
  settings?: {
    notifications?: boolean;
    theme?: "light" | "dark" | "system";
    language?: string;
  };
}

export interface AuthResponse {
  user: AppUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
