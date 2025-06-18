import React, { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import RoleSelector from "./RoleSelector";
import { db, auth } from "../utils/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  photoURL?: string;
}

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, orderBy("displayName", "asc"));
        const querySnapshot = await getDocs(q);

        const fetchedUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedUsers.push({
            id: doc.id,
            email: data.email || "",
            displayName: data.displayName || "Unknown User",
            role: data.role || "user",
            status: data.status || "Active",
            lastLogin: data.lastLogin
              ? new Date(data.lastLogin.toDate()).toLocaleString()
              : "Never",
            photoURL: data.photoURL,
          });
        });

        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load users. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [addToast]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle role change - Update in Firestore
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Update user role in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      addToast({
        type: "success",
        title: "Role Updated",
        message: `User role has been successfully updated to ${newRole}.`,
      });

      // Log the role change action
      await addDoc(collection(db, "activityLogs"), {
        type: "role_change",
        userId: userId,
        newRole: newRole,
        performedBy: auth.currentUser?.uid,
        performedByName: auth.currentUser?.displayName,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update user role. Please try again.",
      });
    } finally {
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };

  // Open role selector modal
  const openRoleSelector = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  // Close role selector modal
  const closeRoleSelector = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter
  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
  };

  // Handle status filter
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  return (
    <div className="dashboard-container user-management-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Management</h1>
        <div className="dashboard-actions">
          <button className="dashboard-button primary">Invite User</button>
        </div>
      </div>

      {/* Filter/Search Bar */}
      <div className="filter-container">
        <div className="search-box">
          <input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search users"
          />
        </div>
        <div className="filter-box">
          <label htmlFor="roleFilter">Role:</label>
          <select
            id="roleFilter"
            value={filterRole}
            onChange={handleRoleFilter}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="user">Standard User</option>
            <option value="readonly">Read Only</option>
          </select>
        </div>
        <div className="filter-box">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={handleStatusFilter}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="dashboard-card">
        <div className="card-content no-padding">
          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">Loading users...</div>
            </div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <h3>No users found</h3>
                  <p>No users match your current search and filters.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="user-cell">
                            <div className="user-avatar">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {user.displayName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="user-name">{user.displayName}</div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge badge-${user.role}`}>
                              {user.role === "admin" && "Administrator"}
                              {user.role === "manager" && "Manager"}
                              {user.role === "supervisor" && "Supervisor"}
                              {user.role === "user" && "Standard User"}
                              {user.role === "readonly" && "Read Only"}
                              {![
                                "admin",
                                "manager",
                                "supervisor",
                                "user",
                                "readonly",
                              ].includes(user.role) && user.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge badge-${user.status.toLowerCase()}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>{user.lastLogin}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-button"
                                onClick={() => openRoleSelector(user)}
                                aria-label={`Change role for ${user.displayName}`}
                              >
                                Change Role
                              </button>
                              <button
                                className="action-button"
                                aria-label={`View details for ${user.displayName}`}
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Selector Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            role="dialog"
            aria-labelledby="role-modal-title"
          >
            <div className="modal-header">
              <h2 id="role-modal-title">Change User Role</h2>
              <button
                className="modal-close"
                onClick={closeRoleSelector}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="user-info">
                <div className="user-avatar large">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName}
                    />
                  ) : (
                    <div className="avatar-placeholder large">
                      {selectedUser.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h3>{selectedUser.displayName}</h3>
                  <p>{selectedUser.email}</p>
                  <p>
                    Current Role:{" "}
                    <span className="badge badge-role">
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
              </div>
              <RoleSelector
                userId={selectedUser.id}
                currentRole={selectedUser.role}
                onRoleChange={(newRole) =>
                  handleRoleChange(selectedUser.id, newRole)
                }
              />
            </div>
            <div className="modal-footer">
              <button
                className="dashboard-button secondary"
                onClick={closeRoleSelector}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
