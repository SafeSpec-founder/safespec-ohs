<<<<<<< HEAD
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import theme from '@styles/theme';
import AppRouter from '@router/AppRouter';
import { AuthProvider } from '@contexts/AuthContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import { OfflineProvider } from '@contexts/OfflineContext';
import { registerServiceWorker } from '@services/serviceWorkerRegistration';
import { initializeOfflineSync } from '@services/syncService';

const App: React.FC = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
    
    // Initialize offline sync
    initializeOfflineSync();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <OfflineProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </OfflineProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import Dashboard from './pages/Dashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SafetyProcedures from './pages/SafetyProcedures';
import SafetyCharts from './pages/SafetyCharts';
import PerformanceMetrics from './pages/PerformanceMetrics';
import IncidentReports from './pages/IncidentReports';
import DailyReports from './pages/DailyReports';
import WeeklyReports from './pages/WeeklyReports';
import MonthlyReports from './pages/MonthlyReports';
import DocumentManager from './pages/DocumentManager';
import EquipmentManager from './pages/EquipmentManager';
import PermitManager from './pages/PermitManager';
import ReportCreator from './pages/ReportCreator';
import Settings from './pages/Settings';
import Automations from './pages/Automations';
import AIAssistant from './pages/AIAssistant';
import LoginHistory from './pages/LoginHistory';
import PendingApprovals from './pages/PendingApprovals';
import UserManagement from './pages/UserManagement';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// PWA registration
// Using type assertion to handle the virtual module import
const registerSW = (options: any) => {
  console.log('PWA registration options:', options);
  return () => console.log('PWA update function called');
};

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    try {
      if (confirm('New content available. Reload?')) {
        // No argument needed with our mock implementation
        updateSW();
      }
    } catch (error) {
      console.error("Error updating service worker:", error);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ element: React.ReactElement; adminOnly?: boolean }> = ({ 
  element, 
  adminOnly = false 
}) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }
  
  return element;
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// App Content Component (separated to use hooks inside Router)
const AppContent: React.FC = () => {
  const { user, userRole, signIn } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(true);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = React.useState<boolean>(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = React.useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState<boolean>(false);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const messagesRef = React.useRef<HTMLDivElement>(null);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const notificationsButtonRef = React.useRef<HTMLButtonElement>(null);
  const messagesButtonRef = React.useRef<HTMLButtonElement>(null);
  const userButtonRef = React.useRef<HTMLButtonElement>(null);

  // Fetch real notifications and messages from Firestore
  React.useEffect(() => {
    if (!user) return;
    
    try {
      // Set up real-time listeners for notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            message: data.message,
            time: formatTimestamp(data.timestamp),
            read: data.read || false
          };
        });
        setNotifications(notificationsData);
      }, (error) => {
        console.error("Error fetching notifications:", error);
      });
      
      // Set up real-time listeners for messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.senderName,
            message: data.content,
            time: formatTimestamp(data.timestamp),
            read: data.read || false,
            avatar: data.senderAvatar
          };
        });
        setMessages(messagesData);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });
      
      // Cleanup listeners on unmount
      return () => {
        unsubscribeNotifications();
        unsubscribeMessages();
      };
    } catch (error) {
      console.error("Error setting up data listeners:", error);
    }
  }, [user]);
  
  // Helper function to format timestamps
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const now = new Date();
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return '';
    }
  };

  // Handle marking notification as read
  const markNotificationAsRead = (id: string) => {
    try {
      // Update Firestore
      updateDoc(doc(db, "notifications", id), { read: true });
      
      // Local state will update automatically via the onSnapshot listener
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  };

  // Handle marking message as read
  const markMessageAsRead = (id: string) => {
    try {
      // Update Firestore
      updateDoc(doc(db, "messages", id), { read: true });
      
      // Local state will update automatically via the onSnapshot listener
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        // Notifications dropdown
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node) &&
            notificationsButtonRef.current && !notificationsButtonRef.current.contains(event.target as Node)) {
          setShowNotificationsDropdown(false);
        }
        
        // Messages dropdown
        if (messagesRef.current && !messagesRef.current.contains(event.target as Node) &&
            messagesButtonRef.current && !messagesButtonRef.current.contains(event.target as Node)) {
          setShowMessagesDropdown(false);
        }
        
        // User dropdown
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node) &&
            userButtonRef.current && !userButtonRef.current.contains(event.target as Node)) {
          setShowUserDropdown(false);
        }
      } catch (error) {
        console.error("Error handling click outside:", error);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation for dropdowns
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        // Close dropdowns on Escape key
        if (event.key === 'Escape') {
          if (showNotificationsDropdown) setShowNotificationsDropdown(false);
          if (showMessagesDropdown) setShowMessagesDropdown(false);
          if (showUserDropdown) setShowUserDropdown(false);
        }
      } catch (error) {
        console.error("Error handling keyboard navigation:", error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotificationsDropdown, showMessagesDropdown, showUserDropdown]);

  // Toggle notifications dropdown with keyboard support
  const toggleNotificationsDropdown = () => {
    try {
      const newState = !showNotificationsDropdown;
      setShowNotificationsDropdown(newState);
      
      // Close other dropdowns
      if (newState) {
        setShowMessagesDropdown(false);
        setShowUserDropdown(false);
      }
    } catch (error) {
      console.error("Error toggling notifications dropdown:", error);
    }
  };

  // Toggle messages dropdown with keyboard support
  const toggleMessagesDropdown = () => {
    try {
      const newState = !showMessagesDropdown;
      setShowMessagesDropdown(newState);
      
      // Close other dropdowns
      if (newState) {
        setShowNotificationsDropdown(false);
        setShowUserDropdown(false);
      }
    } catch (error) {
      console.error("Error toggling messages dropdown:", error);
    }
  };

  // Toggle user dropdown with keyboard support
  const toggleUserDropdown = () => {
    try {
      const newState = !showUserDropdown;
      setShowUserDropdown(newState);
      
      // Close other dropdowns
      if (newState) {
        setShowNotificationsDropdown(false);
        setShowMessagesDropdown(false);
      }
    } catch (error) {
      console.error("Error toggling user dropdown:", error);
    }
  };

  // If not logged in, show login screen
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.png" alt="SafeSpec Logo" />
          </div>
          <h1>SafeSpec OHS Suite</h1>
          <p>Firebase Test Version</p>
          <p>Sign in to access the safety management platform</p>
          <button className="login-button" onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Get unread counts
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Main content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/enhanced-dashboard" element={<ProtectedRoute element={<EnhancedDashboard />} />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} adminOnly={true} />} />
          <Route path="/safety-procedures" element={<ProtectedRoute element={<SafetyProcedures />} />} />
          <Route path="/safety-charts" element={<ProtectedRoute element={<SafetyCharts />} />} />
          <Route path="/performance-metrics" element={<ProtectedRoute element={<PerformanceMetrics />} />} />
          <Route path="/incident-reports" element={<ProtectedRoute element={<IncidentReports />} />} />
          <Route path="/daily-reports" element={<ProtectedRoute element={<DailyReports />} />} />
          <Route path="/weekly-reports" element={<ProtectedRoute element={<WeeklyReports />} />} />
          <Route path="/monthly-reports" element={<ProtectedRoute element={<MonthlyReports />} />} />
          <Route path="/document-manager" element={<ProtectedRoute element={<DocumentManager />} />} />
          <Route path="/equipment-manager" element={<ProtectedRoute element={<EquipmentManager />} />} />
          <Route path="/permit-manager" element={<ProtectedRoute element={<PermitManager />} />} />
          <Route path="/report-creator" element={<ProtectedRoute element={<ReportCreator />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/automations" element={<ProtectedRoute element={<Automations />} />} />
          <Route path="/ai-assistant" element={<ProtectedRoute element={<AIAssistant />} />} />
          <Route path="/login-history" element={<ProtectedRoute element={<LoginHistory />} adminOnly={true} />} />
          <Route path="/pending-approvals" element={<ProtectedRoute element={<PendingApprovals />} />} />
          <Route path="/user-management" element={<ProtectedRoute element={<UserManagement />} adminOnly={true} />} />
          <Route path="/access-denied" element={<div className="access-denied">Access Denied</div>} />
          <Route path="*" element={<div className="not-found">Page Not Found</div>} />
        </Routes>
      </main>
    </div>
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
  );
};

export default App;
