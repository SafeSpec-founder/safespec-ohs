import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { authService } from "../services/authService";
import { AppUser } from "../models";

// Define the shape of the auth context
export interface AuthContextType {
  user: AppUser | null;
  userRole: string | null;
  userPermissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  updateProfile: (updates: Partial<AppUser>) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>; // Add this
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  userPermissions: [],
  loading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  register: async () => false,
  updateProfile: async () => false,
  login: async () => {}, // Add this
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Real Firebase auth state listener
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Get user data from Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const appUser: AppUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: userData.email || firebaseUser.email || "",
              displayName:
                userData.displayName || firebaseUser.displayName || "",
              role: userData.role || "user",
              permissions: userData.permissions || [],
              ...userData,
            };
            setUser(appUser);
            setUserRole(appUser.role);
            setUserPermissions(appUser.permissions || []);
          } else {
            // New user, set default role and permissions
            const defaultTenantId =
              import.meta.env.VITE_DEFAULT_TENANT_ID || "tenant_001";
            const defaultUser: AppUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "employee",
              tenantId: defaultTenantId,
              isActive: true,
              permissions: [
                "view_incidents",
                "create_incidents",
                "view_documents",
                "view_corrective_actions",
                "view_reports",
                "use_ai_assistant",
              ],
            };
            await setDoc(userRef, {
              ...defaultUser,
              createdAt: serverTimestamp(),
            });
            setUser(defaultUser);
            setUserRole(defaultUser.role);
            setUserPermissions(defaultUser.permissions || []);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setUserPermissions([]);
        }
        setLoading(false);
      });

      // Cleanup subscription
      return () => unsubscribe();
    } catch (error) {
      console.error("Error in auth state change listener:", error);
      setLoading(false);
    }
  }, []);

  // Sign in with Google
  const signIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<AppUser>): Promise<boolean> => {
    try {
      const result = await authService.updateProfile(updates);
      return result !== undefined; // Ensure a boolean is returned
    } catch (error) {
      console.error("Error updating profile:", error);
      return false; // Return false in case of an error
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Register new user
  const register = async (userData: any) => {
    try {
      setLoading(true);
      await authService.register(userData);
      return true;
    } catch (error) {
      console.error("Error registering:", error);
      setLoading(false);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await authService.login(email, password);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error; // Re-throw the error to handle it in LoginPage
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    userRole,
    userPermissions,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    register,
    updateProfile,
    login, // Add this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
