import React, { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { db } from "../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  onRoleChange?: (newRole: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  userId,
  currentRole,
  onRoleChange,
}) => {
  const { addToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Available roles
  const roles = [
    { id: "admin", name: "Administrator", description: "Full system access" },
    {
      id: "manager",
      name: "Manager",
      description: "Department management access",
    },
    {
      id: "supervisor",
      name: "Supervisor",
      description: "Team supervision access",
    },
    { id: "user", name: "Standard User", description: "Basic system access" },
    { id: "readonly", name: "Read Only", description: "View-only access" },
  ];

  // Handle role change
  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      addToast({
        type: "info",
        title: "No Change",
        message: "The selected role is the same as the current role.",
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Update user role in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: selectedRole,
        updatedAt: new Date(),
      });

      // Call the onRoleChange callback if provided
      if (onRoleChange) {
        onRoleChange(selectedRole);
      }

      addToast({
        type: "success",
        title: "Role Updated",
        message: `User role has been updated to ${roles.find((r) => r.id === selectedRole)?.name || selectedRole}.`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update user role. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="role-selector">
      <div className="role-options">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-option ${selectedRole === role.id ? "selected" : ""}`}
            onClick={() => setSelectedRole(role.id)}
          >
            <div className="role-option-header">
              <input
                type="radio"
                id={`role-${role.id}`}
                name="role"
                value={role.id}
                checked={selectedRole === role.id}
                onChange={() => setSelectedRole(role.id)}
                aria-describedby={`role-desc-${role.id}`}
              />
              <label htmlFor={`role-${role.id}`}>{role.name}</label>
            </div>
            <p id={`role-desc-${role.id}`} className="role-description">
              {role.description}
            </p>
          </div>
        ))}
      </div>
      <div className="role-actions">
        <button
          className="dashboard-button primary"
          onClick={handleRoleChange}
          disabled={isUpdating || selectedRole === currentRole}
        >
          {isUpdating ? "Updating..." : "Update Role"}
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
