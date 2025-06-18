import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { db } from "../utils/firebase"; // Assuming db is exported from firebase.ts
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp, // Import Timestamp
} from "firebase/firestore";

// Interface for Firestore approval document
interface Approval {
  id: string; // Firestore document ID
  type: string;
  requestorId: string;
  requestorName: string;
  requestorEmail?: string;
  details: string;
  requestedTimestamp: Timestamp; // Use Firestore Timestamp
  status: "pending" | "approved" | "rejected";
  // Add other relevant fields like targetId (e.g., userId for role change)
}

// Interface for Firestore activity log document
interface Activity {
  id: string; // Firestore document ID
  approvalId: string;
  requestType: string;
  requestorName: string;
  action: "approved" | "rejected";
  actionedByUid: string;
  actionedByName: string;
  actionedTimestamp: Timestamp;
  details?: string; // Optional details
}

const PendingApprovals: React.FC = () => {
  const { user, userRole } = useAuth(); // Get full user object for UID and name
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(true);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);

  const typedUser = user as { uid: string; displayName: string | null }; // Cast user for needed properties

  // Redirect non-admin users
  useEffect(() => {
    if (userRole !== "admin") {
      addToast({
        type: "error",
        title: "Access Denied",
        message: "You do not have permission to view this page.",
      });
      navigate("/"); // Navigate to base dashboard
    }
  }, [userRole, navigate, addToast]);

  // Fetch Pending Approvals from Firestore
  useEffect(() => {
    if (userRole !== "admin") return; // Only fetch if admin

    setLoadingApprovals(true);
    const approvalsCollection = collection(db, "approvals");
    const q = query(
      approvalsCollection,
      where("status", "==", "pending"),
      orderBy("requestedTimestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedApprovals: Approval[] = [];
        querySnapshot.forEach((doc) => {
          fetchedApprovals.push({ id: doc.id, ...doc.data() } as Approval);
        });
        setApprovals(fetchedApprovals);
        setLoadingApprovals(false);
      },
      (error) => {
        console.error("Error fetching pending approvals: ", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Could not load pending approvals.",
        });
        setLoadingApprovals(false);
      },
    );

    return () => unsubscribe(); // Cleanup listener
  }, [userRole, addToast]);

  // Fetch Recent Activity from Firestore
  useEffect(() => {
    if (userRole !== "admin") return;

    setLoadingActivity(true);
    const activityCollection = collection(db, "approvalActivity");
    // Get latest 10 activities
    const q = query(
      activityCollection,
      orderBy("actionedTimestamp", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedActivities: Activity[] = [];
        querySnapshot.forEach((doc) => {
          fetchedActivities.push({ id: doc.id, ...doc.data() } as Activity);
        });
        setRecentActivity(fetchedActivities);
        setLoadingActivity(false);
      },
      (error) => {
        console.error("Error fetching recent activity: ", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Could not load recent activity.",
        });
        setLoadingActivity(false);
      },
    );

    return () => unsubscribe(); // Cleanup listener
  }, [userRole, addToast]);

  const handleApprovalAction = async (
    id: string,
    action: "approved" | "rejected",
  ): Promise<void> => {
    if (!typedUser) {
      addToast({ type: "error", title: "Error", message: "User not found." });
      return;
    }

    const approvalDocRef = doc(db, "approvals", id);
    const activityCollectionRef = collection(db, "approvalActivity");
    const approvedItem = approvals.find((a) => a.id === id);

    if (!approvedItem) {
      addToast({
        type: "error",
        title: "Error",
        message: "Approval request not found.",
      });
      return;
    }

    try {
      // 1. Update the approval document status
      await updateDoc(approvalDocRef, { status: action });

      // 2. Add a record to the activity log
      const newActivity: Omit<Activity, "id"> = {
        approvalId: id,
        requestType: approvedItem.type,
        requestorName: approvedItem.requestorName,
        action: action,
        actionedByUid: typedUser.uid,
        actionedByName: typedUser.displayName || "Admin",
        actionedTimestamp: serverTimestamp() as Timestamp, // Use server timestamp
        details: `${action === "approved" ? "Approved" : "Rejected"} ${approvedItem.type} for ${approvedItem.requestorName}.`,
      };
      await addDoc(activityCollectionRef, newActivity);

      // UI update will be handled by the onSnapshot listeners
      addToast({
        type: action === "approved" ? "success" : "info",
        title: `Request ${action === "approved" ? "Approved" : "Rejected"}`,
        message: `${approvedItem.type} for ${approvedItem.requestorName} ${action}.`,
      });
    } catch (error) {
      console.error(`Error ${action} request: `, error);
      addToast({
        type: "error",
        title: "Error",
        message: `Could not ${action} the request.`,
      });
    }
  };

  const handleRowClick = (activity: Activity): void => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const closeModal = (): void => {
    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  // Format Firestore Timestamp
  const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleString(); // Adjust formatting as needed
  };

  // Only render if admin
  if (userRole !== "admin") {
    return null; // Or a loading indicator while redirecting
  }

  return (
    <div className="dashboard-container pending-approvals">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Pending Approvals</h1>
      </div>

      {/* Pending Approval Requests Section */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">
            Approval Requests ({loadingApprovals ? "..." : approvals.length})
          </div>
        </div>
        <div className="card-content">
          <div className="approvals-list">
            {loadingApprovals ? (
              <div className="loading-state">Loading pending approvals...</div>
            ) : approvals.length === 0 ? (
              <div className="empty-state">
                {/* SVG Icon */}
                <h3>No Pending Approvals</h3>
                <p>All approval requests have been processed.</p>
              </div>
            ) : (
              approvals.map((approval) => (
                <div key={approval.id} className="approval-item">
                  <div className="approval-content">
                    <div className="approval-title">{approval.type}</div>
                    <div className="approval-description">
                      <strong>{approval.requestorName}</strong>{" "}
                      {approval.requestorEmail &&
                        `(${approval.requestorEmail})`}{" "}
                      {approval.details}
                    </div>
                    <div className="approval-time">
                      Requested {formatTimestamp(approval.requestedTimestamp)}
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button
                      className="approval-action-button approve"
                      onClick={() =>
                        handleApprovalAction(approval.id, "approved")
                      }
                    >
                      {/* SVG Icon */}
                      Approve
                    </button>
                    <button
                      className="approval-action-button reject"
                      onClick={() =>
                        handleApprovalAction(approval.id, "rejected")
                      }
                    >
                      {/* SVG Icon */}
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Recent Approval Activity</div>
        </div>
        <div className="card-content no-padding">
          <div className="recent-activity-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Requestor</th>
                  <th>Action</th>
                  <th>Actioned By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingActivity ? (
                  <tr>
                    <td colSpan={5} className="loading-state-row">
                      Loading activity...
                    </td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state-row">
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      onClick={() => handleRowClick(activity)}
                      className="clickable-row"
                    >
                      <td>{activity.requestType}</td>
                      <td>{activity.requestorName}</td>
                      <td>
                        <span
                          className={`badge ${activity.action === "approved" ? "badge-success" : "badge-error"}`}
                        >
                          {activity.action}
                        </span>
                      </td>
                      <td>{activity.actionedByName}</td>
                      <td>{formatTimestamp(activity.actionedTimestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {showActivityModal && selectedActivity && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Activity Details</h2>
              <button
                type="button"
                className="close-button"
                onClick={closeModal}
              >
                {/* SVG Close Icon */}
              </button>
            </div>
            <div className="modal-content">
              <p>
                <strong>Request Type:</strong> {selectedActivity.requestType}
              </p>
              <p>
                <strong>Requestor:</strong> {selectedActivity.requestorName}
              </p>
              <p>
                <strong>Action:</strong>
                <span
                  className={`badge ${selectedActivity.action === "approved" ? "badge-success" : "badge-error"}`}
                >
                  {selectedActivity.action}
                </span>
              </p>
              <p>
                <strong>Actioned By:</strong> {selectedActivity.actionedByName}{" "}
                ({selectedActivity.actionedByUid})
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formatTimestamp(selectedActivity.actionedTimestamp)}
              </p>
              {selectedActivity.details && (
                <p>
                  <strong>Details:</strong> {selectedActivity.details}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="dashboard-button"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Include existing styles */}
      <style>{`
        /* ... existing styles ... */
        .loading-state, .loading-state-row {
          padding: 1rem;
          text-align: center;
          color: var(--text-secondary);
        }
         .pending-approvals .dashboard-card {
          margin-bottom: 1.5rem;
        }
        .pending-approvals .approvals-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pending-approvals .approval-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background-color: var(--card-bg-alt, #f9fafb);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }
        .pending-approvals .approval-content {
          flex: 1;
          margin-right: 1rem;
        }
        .pending-approvals .approval-title {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .pending-approvals .approval-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .pending-approvals .approval-description strong {
          color: var(--text-primary);
        }
        .pending-approvals .approval-time {
          color: var(--text-tertiary);
          font-size: 0.8rem;
        }
        .pending-approvals .approval-actions {
          display: flex;
          gap: 0.5rem;
        }
        .pending-approvals .approval-action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--border-radius-small);
          border: none;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .pending-approvals .approval-action-button.approve {
          background-color: var(--success-light);
          color: var(--success-dark);
        }
        .pending-approvals .approval-action-button.approve:hover {
          background-color: var(--success-color);
          color: white;
        }
        .pending-approvals .approval-action-button.reject {
          background-color: var(--error-light);
          color: var(--error-dark);
        }
        .pending-approvals .approval-action-button.reject:hover {
          background-color: var(--error-color);
          color: white;
        }
        .pending-approvals .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--text-secondary);
          text-align: center;
        }
        .pending-approvals .empty-state svg {
          margin-bottom: 1rem;
          color: var(--icon-color-light);
        }
        .pending-approvals .empty-state h3 {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .pending-approvals .card-content.no-padding {
          padding: 0;
        }
        .pending-approvals .recent-activity-table-container {
          max-height: 250px; /* Limit height for scrolling (adjust as needed) */
          overflow-y: auto;
          border-radius: 0 0 var(--border-radius) var(--border-radius);
        }
        .pending-approvals .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pending-approvals .data-table th,
        .pending-approvals .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
        }
        .pending-approvals .data-table th {
          background-color: var(--background-alt);
          font-weight: 600;
          color: var(--text-secondary);
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .pending-approvals .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .pending-approvals .data-table tbody tr.clickable-row {
            cursor: pointer;
            transition: background-color 0.15s ease-in-out;
        }
        .pending-approvals .data-table tbody tr.clickable-row:hover {
            background-color: var(--background-alt-hover);
        }
        .pending-approvals .badge {
          padding: 0.2em 0.6em;
          border-radius: 1em;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .pending-approvals .badge-success {
          background-color: var(--success-light);
          color: var(--success-dark);
        }
        .pending-approvals .badge-error {
          background-color: var(--error-light);
          color: var(--error-dark);
        }
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background-color: var(--card-bg);
          padding: 1.5rem;
          border-radius: var(--border-radius-large);
          box-shadow: var(--shadow-lg);
          width: 90%;
          max-width: 500px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        .modal-header .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--icon-color);
          padding: 0.25rem;
        }
         .modal-header .close-button svg {
            display: block; /* Ensures SVG takes up space */
        }
        .modal-content p {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .modal-content strong {
          color: var(--text-primary);
          margin-right: 0.5rem;
        }
        .modal-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          margin-top: 1rem;
          text-align: right;
        }
        .modal-footer .dashboard-button {
            /* Use existing button styles */
        }
      `}</style>
    </div>
  );
};

export default PendingApprovals;
