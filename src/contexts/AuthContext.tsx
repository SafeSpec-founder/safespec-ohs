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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
