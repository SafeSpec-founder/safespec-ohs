import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile as firebaseUpdateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { api } from "./apiService";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    permissions: string[];
  };
  token: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  tenantId?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();

      // Check if user is active (default to true when field is missing)
      if (userData.isActive === false) {
        await signOut(auth);
        throw new Error("Account is deactivated");
      }

      // Get Firebase ID token
      const token = await user.getIdToken();

      // Update last login
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date(),
      });

      // Store tokens in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          tenantId: userData.tenantId,
          permissions: userData.permissions,
        }),
      );

      return {
        user: {
          id: user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          tenantId: userData.tenantId,
          permissions: userData.permissions,
        },
        token,
        refreshToken: "", // Firebase handles refresh automatically
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  async register(userData: RegisterData): Promise<void> {
    try {
      // Use the backend API for registration to handle user creation properly
      const response = await api.post("/auth/register", userData);
      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Logout failed");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw new Error(error.message || "Failed to send reset email");
    }
  },

  async resetPassword(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw new Error(error.message || "Failed to reset password");
    }
  },

  async getCurrentUser(): Promise<AuthResponse["user"] | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();

      return {
        id: user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        tenantId: userData.tenantId,
        permissions: userData.permissions,
      };
    } catch (error: any) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  async updateProfile(
    updates: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      department: string;
      position: string;
    }>,
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user");
    }

    // Update Firebase Auth profile if name changed
    if (updates.firstName || updates.lastName) {
      const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
      const firstName = updates.firstName || currentUserData.firstName;
      const lastName = updates.lastName || currentUserData.lastName;

      await firebaseUpdateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
    }

    // Update Firestore document
    await updateDoc(doc(db, "users", user.uid), {
      ...updates,
      updatedAt: new Date(),
    });

    // Update localStorage
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  },

  async refreshToken(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }

      // Force token refresh
      const token = await user.getIdToken(true);
      localStorage.setItem("token", token);

      return token;
    } catch (error: any) {
      console.error("Token refresh error:", error);
      throw new Error(error.message || "Failed to refresh token");
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!auth.currentUser && !!localStorage.getItem("token");
  },

  // Get stored user data
  getStoredUser(): AuthResponse["user"] | null {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  },

  // Get current Firebase user
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  },
};

export const updateProfile = authService.updateProfile;
