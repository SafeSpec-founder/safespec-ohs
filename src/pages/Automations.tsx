import React, { useState, useEffect } from "react";
import { logger } from "../utils/logger";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  schedule: string;
  status: string;
}

interface AutomationHistory {
  id: string;
  automationId: string;
  automationName: string;
  executionTime: string;
  rawTimestamp: any;
  status: string;
  duration: string;
}

const Automations: React.FC = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [automationHistory, setAutomationHistory] = useState<
    AutomationHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch automations from Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Create a query to get automations
      const automationsQuery = query(
        collection(db, "automations"),
        orderBy("name"),
      );

      // Set up real-time listener for automations
      const unsubscribeAutomations = onSnapshot(
        automationsQuery,
        (snapshot) => {
          const automationsData: Automation[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              trigger: data.trigger,
              schedule: data.schedule,
              status: data.status,
            };
          });

          setAutomations(automationsData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching automations:", error);
          setIsLoading(false);
        },
      );

      // Create a query to get automation history
      const historyQuery = query(
        collection(db, "automationHistory"),
        orderBy("timestamp", "desc"),
      );

      // Set up real-time listener for automation history
      const unsubscribeHistory = onSnapshot(
        historyQuery,
        (snapshot) => {
          const historyData: AutomationHistory[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              automationId: data.automationId,
              automationName: data.automationName,
              executionTime: formatTimestamp(data.timestamp),
              rawTimestamp: data.timestamp,
              status: data.status,
              duration: data.duration,
            };
          });

          setAutomationHistory(historyData);
        },
        (error) => {
          console.error("Error fetching automation history:", error);
        },
      );

      // Cleanup listeners on unmount
      return () => {
        unsubscribeAutomations();
        unsubscribeHistory();
      };
    } catch (error) {
      console.error("Error setting up automations listeners:", error);
      setIsLoading(false);
    }
  }, [user]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      } else {
        return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  // Toggle automation status in Firestore
  const toggleAutomationStatus = async (id: string): Promise<void> => {
    try {
      // Find the automation to toggle
      const automation = automations.find((a) => a.id === id);
      if (!automation) return;

      // Determine new status
      const newStatus = automation.status === "Active" ? "Inactive" : "Active";

      // Update in Firestore
      const automationRef = doc(db, "automations", id);
      await updateDoc(automationRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || "Unknown User",
        updatedById: user?.uid,
      });

      // Log the status change
      const historyRef = collection(db, "automationHistory");
      await addDoc(historyRef, {
        automationId: id,
        automationName: automation.name,
        action: "status_change",
        previousStatus: automation.status,
        newStatus: newStatus,
        timestamp: serverTimestamp(),
        performedBy: user?.displayName || "Unknown User",
        performedById: user?.uid,
      });

      // No need to update local state as the onSnapshot listener will catch the change
    } catch (error) {
      console.error(`Error toggling automation status for ${id}:`, error);
      alert("Failed to update automation status. Please try again.");
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Automations</h1>
        <div className="dashboard-actions">
          <button className="dashboard-button primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Create Automation
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Active Automations</div>
          <div className="card-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search automations..."
              />
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">Loading automations...</div>
            </div>
          ) : automations.length === 0 ? (
            <div className="empty-state">
              <h3>No automations found</h3>
              <p>Create your first automation to get started.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Automation Name</th>
                  <th>Trigger Type</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {automations.map((automation) => (
                  <tr key={automation.id}>
                    <td>{automation.name}</td>
                    <td>{automation.trigger}</td>
                    <td>{automation.schedule}</td>
                    <td>
                      <span
                        className={`badge ${automation.status === "Active" ? "badge-success" : "badge-warning"}`}
                      >
                        {automation.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          title="Edit"
                          onClick={() =>
                            logger.info(`Edit automation ${automation.id}`)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="action-button"
                          title={
                            automation.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => toggleAutomationStatus(automation.id)}
                        >
                          {automation.status === "Active" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="9" y1="12" x2="15" y2="12"></line>
                              <line x1="12" y1="9" x2="12" y2="15"></line>
                            </svg>
                          )}
                        </button>
                        <button
                          className="action-button"
                          title="Run Now"
                          onClick={() =>
                            logger.info(`Run automation ${automation.id}`)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Automation History</div>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">Loading automation history...</div>
            </div>
          ) : automationHistory.length === 0 ? (
            <div className="empty-state">
              <h3>No automation history</h3>
              <p>History will appear here when automations are executed.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Automation</th>
                  <th>Execution Time</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {automationHistory.map((history) => (
                  <tr key={history.id}>
                    <td>{history.automationName}</td>
                    <td>{history.executionTime}</td>
                    <td>
                      <span
                        className={`badge ${history.status === "Success" ? "badge-success" : "badge-error"}`}
                      >
                        {history.status}
                      </span>
                    </td>
                    <td>{history.duration}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          title="View Details"
                          onClick={() => {
                            // In a real implementation, this would open a modal with details
                            alert(`Details for execution ${history.id}`);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Automations;
