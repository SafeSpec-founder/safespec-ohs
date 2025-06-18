import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

// Interface for Firestore system log document
interface SystemLog {
  id: string; // Firestore document ID
  timestamp: Timestamp;
  userId: string; // UID of the user performing the action
  userName: string; // Display name of the user
  action: string; // e.g., 'Login', 'Logout', 'User Role Changed', 'Document Uploaded'
  details: string; // e.g., 'Successful login from IP 1.2.3.4', 'Changed role of user X to admin'
  ipAddress?: string; // Optional: IP address for login events
  device?: string; // Optional: Device info for login events
}

const LoginHistory: React.FC = () => {
  const { userRole } = useAuth();
  const { addToast } = useToast();
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch System Logs from Firestore
  useEffect(() => {
    if (userRole !== "admin") return; // Only admins can view system logs

    setLoading(true);
    // Assuming a global 'systemLogs' collection
    const logsCollection = collection(db, "systemLogs");
    // Order by timestamp descending, limit to latest 100 (adjust as needed)
    const q = query(logsCollection, orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedLogs: SystemLog[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as SystemLog);
        });
        setSystemLogs(fetchedLogs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching system logs: ", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Could not load system logs.",
        });
        setLoading(false);
      },
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userRole, addToast]);

  // Format Firestore Timestamp
  const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleString(); // Adjust formatting as needed
  };

  // Filter logs based on search term
  const filteredLogs = systemLogs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchLower)) ||
      (log.userId && log.userId.toLowerCase().includes(searchLower))
    );
  });

  if (userRole !== "admin") {
    return (
      <div className="access-denied">
        Access Denied. You must be an administrator to view system logs.
      </div>
    );
  }

  return (
    <div className="dashboard-container system-logs">
      <div className="dashboard-header">
        <h1 className="dashboard-title">System Logs</h1>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">
            Recent Activity ({loading ? "..." : filteredLogs.length})
          </div>
          <div className="card-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search logs (user, action, details)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* SVG Search Icon */}
            </div>
          </div>
        </div>
        <div className="card-content no-padding">
          <div className="logs-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  {/* Add other relevant columns like Device if needed */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="loading-state-row">
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state-row">
                      No matching logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>
                        {log.userName} ({log.userId})
                      </td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                      <td>{log.ipAddress || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Styling (Consider moving to CSS) */}
      <style>{`
        .system-logs .logs-table-container {
          max-height: 70vh; /* Adjust as needed */
          overflow-y: auto;
        }
        .system-logs .search-container {
          position: relative;
        }
        .system-logs .search-input {
          padding: 0.5rem 0.8rem;
          padding-right: 2.5rem; /* Space for icon */
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          min-width: 250px;
        }
        .system-logs .search-icon {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--icon-color-light);
        }
        /* Inherit other table styles */
      `}</style>
    </div>
  );
};

export default LoginHistory;
