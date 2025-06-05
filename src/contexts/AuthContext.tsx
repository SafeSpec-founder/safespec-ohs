<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  checkPermission: (permission: string) => Promise<boolean>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  updateProfile: async () => false,
  checkPermission: async () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(email, password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const checkPermission = async (permission: string): Promise<boolean> => {
    try {
      return await authService.checkPermission(permission);
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    checkPermission,
=======
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

// Define user roles
export type UserRole = 'user' | 'admin' | 'manager';

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Real Firebase auth state listener
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
          // Get user role from Firestore
          await getUserRole(currentUser.uid);
          
          // Log login to Firestore
          await logUserLogin(currentUser);
        } else {
          setUserRole(null);
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

  // Get user role from Firestore
  const getUserRole = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserRole(userData.role || 'user');
      } else {
        // New user, set default role
        setUserRole('user');
        await setDoc(userRef, {
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error getting user role:", error);
      setUserRole('user'); // Default to user role on error
    }
  };

  // Log user login to Firestore
  const logUserLogin = async (user: User) => {
    try {
      const logRef = doc(db, 'systemLogs', `login_${Date.now()}`);
      await setDoc(logRef, {
        type: 'login',
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error("Error logging user login:", error);
    }
  };

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

  // Sign out
  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    userRole,
    loading,
    signIn,
    logOut
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

<<<<<<< HEAD
=======
// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
