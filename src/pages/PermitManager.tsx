import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../utils/firebase";

// Interface for Permit
interface Permit {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "Active" | "Pending Approval" | "Expired" | "Closed" | "Revoked";
  issuedTo: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  // Add other fields as needed, e.g., description, associatedDocs
}

// Interface for Permit Statistics
interface PermitStats {
  active: number;
  pending: number;
  expired: number;
  closed: number;
  revoked: number; // Added revoked count
}

// Interface for Create Permit Modal Props
interface CreatePermitModalProps {
  onClose?: () => void;
  onCreate: (
    newPermitData: Omit<Permit, "id" | "issuedBy" | "status"> & {
      status?: Permit["status"];
    },
  ) => void; // Adjust based on creation logic
}

// --- Create Permit Modal Component ---
const CreatePermitModal: React.FC<CreatePermitModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [permitName, setPermitName] = useState("");
  const [permitType, setPermitType] = useState("Hot Work"); // Default type
  const [location, setLocation] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // Default to today
  const [expiryDate, setExpiryDate] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const { addToast } = useToast();

  const permitTypes = [
    "Hot Work",
    "Confined Space",
    "Excavation",
    "Electrical",
    "Heights",
    "Chemical",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitName || !location || !issuedTo || !issuedDate || !expiryDate) {
      addToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      });
      return;
    }
    // Basic date validation
    if (new Date(expiryDate) <= new Date(issuedDate)) {
      addToast({
        type: "error",
        title: "Invalid Dates",
        message: "Expiry date must be after issued date.",
      });
      return;
    }

    const newPermitData = {
      name: permitName,
      type: permitType,
      location: location,
      issuedTo: issuedTo,
      issuedDate: new Date(issuedDate).toLocaleDateString("en-CA"), // Format date
      expiryDate: new Date(expiryDate).toLocaleDateString("en-CA"), // Format date
      // status: 'Pending Approval', // Default status can be set here or in parent
      // issuedBy will be set by parent using logged-in user
    };

    console.log(
      "Creating permit with data:",
      newPermitData,
      "Document:",
      document?.name,
    );
    addToast({
      type: "info",
      title: "Creating Permit",
      message: "Submitting permit request...",
    });
    // Simulate creation
    setTimeout(() => {
      onCreate(newPermitData);
      addToast({
        type: "success",
        title: "Permit Created",
        message: `Permit '${permitName}' submitted for approval.`,
      });
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        {" "}
        {/* Added 'large' class for wider modal */}
        <div className="modal-header">
          <h2>Create New Work Permit</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="form-grid two-column">
              {" "}
              {/* Use two-column grid */}
              {/* Column 1 */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="permitName">Permit Name / Title *</label>
                  <input
                    type="text"
                    id="permitName"
                    value={permitName}
                    onChange={(e) => setPermitName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="permitType">Permit Type *</label>
                  <select
                    id="permitType"
                    value={permitType}
                    onChange={(e) => setPermitType(e.target.value)}
                    required
                  >
                    {permitTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="issuedTo">Issued To (Worker/Team) *</label>
                  <input
                    type="text"
                    id="issuedTo"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Column 2 */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="issuedDate">Issued Date *</label>
                  <input
                    type="date"
                    id="issuedDate"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="documentUpload">
                    Attach Supporting Document (Optional)
                  </label>
                  <input
                    type="file"
                    id="documentUpload"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png" // Specify acceptable file types
                  />
                  {document && (
                    <p className="file-name">Selected: {document.name}</p>
                  )}
                </div>
                {/* Add more fields if needed: Description, Conditions, etc. */}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="dashboard-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="dashboard-button primary">
              Submit Permit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Permit Manager Component ---
const PermitManager: React.FC = () => {
  const { user, userRole } = useAuth(); // Get full user object if needed for issuedBy
  const { addToast } = useToast();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [permitStats, setPermitStats] = useState<PermitStats>({
    active: 0,
    pending: 0,
    expired: 0,
    closed: 0,
    revoked: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firestore collection reference
  const permitsCollectionRef = collection(db, "permits");

  // Function to calculate stats
  const calculateStats = (currentPermits: Permit[]): PermitStats => {
    return currentPermits.reduce(
      (acc, permit) => {
        if (permit.status === "Active") acc.active++;
        else if (permit.status === "Pending Approval") acc.pending++;
        else if (permit.status === "Expired") acc.expired++;
        else if (permit.status === "Closed") acc.closed++;
        else if (permit.status === "Revoked") acc.revoked++;
        return acc;
      },
      { active: 0, pending: 0, expired: 0, closed: 0, revoked: 0 },
    );
  };

  // Load data from Firestore and calculate stats
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Create a query to get permits, ordered by issued date
      const permitsQuery = query(
        permitsCollectionRef,
        orderBy("issuedDate", "desc"),
      );

      // Set up real-time listener for permits
      const unsubscribe = onSnapshot(
        permitsQuery,
        (snapshot) => {
          const permitsData: Permit[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              type: data.type,
              location: data.location,
              status: data.status,
              issuedTo: data.issuedTo,
              issuedBy: data.issuedBy,
              issuedDate: data.issuedDate,
              expiryDate: data.expiryDate,
            };
          });

          setPermits(permitsData);
          setPermitStats(calculateStats(permitsData));
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching permits:", error);
          addToast({
            type: "error",
            title: "Data Loading Error",
            message: "Failed to load permits. Please try refreshing the page.",
          });
          setIsLoading(false);
        },
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up permits listener:", error);
      setIsLoading(false);
    }
  }, [user, addToast, permitsCollectionRef]); // Add missing dependencies

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const permitTypes = [
    "All",
    "Hot Work",
    "Confined Space",
    "Excavation",
    "Electrical",
    "Heights",
    "Chemical",
  ];
  const statusOptions = [
    "All",
    "Active",
    "Pending Approval",
    "Expired",
    "Closed",
    "Revoked",
  ];

  // Filter permits based on search term, type, and status
  const filteredPermits = permits.filter((permit) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      permit.name.toLowerCase().includes(lowerSearchTerm) ||
      permit.location.toLowerCase().includes(lowerSearchTerm) ||
      permit.issuedTo.toLowerCase().includes(lowerSearchTerm) ||
      permit.id.toLowerCase().includes(lowerSearchTerm) || // Search by ID
      permit.type.toLowerCase().includes(lowerSearchTerm); // Search by Type
    const matchesType = selectedType === "All" || permit.type === selectedType;
    const matchesStatus =
      selectedStatus === "All" || permit.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle Create Permit - Add to Firestore
  const handleCreatePermit = async (
    newPermitData: Omit<Permit, "id" | "issuedBy" | "status"> & {
      status?: Permit["status"];
    },
  ): Promise<void> => {
    try {
      // Create new permit document in Firestore
      await addDoc(permitsCollectionRef, {
        ...newPermitData,
        status: "Pending Approval", // Default to Pending
        issuedBy: user?.displayName || "System Admin", // Use logged-in user's name
        createdAt: serverTimestamp(),
        createdById: user?.uid,
      });

      // No need to manually update state as the onSnapshot listener will catch the change
      setShowCreateModal(false);

      addToast({
        type: "success",
        title: "Permit Created",
        message: `Permit '${newPermitData.name}' submitted for approval.`,
      });
    } catch (error) {
      console.error("Error creating permit:", error);
      addToast({
        type: "error",
        title: "Creation Failed",
        message: "Failed to create permit. Please try again.",
      });
    }
  };

  // Handle Status Change (Approve/Revoke) - Update in Firestore
  const handleStatusChange = async (
    id: string,
    newStatus: Permit["status"],
  ): Promise<void> => {
    try {
      // Update the permit document in Firestore
      const permitRef = doc(db, "permits", id);
      await updateDoc(permitRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || "System Admin",
        updatedById: user?.uid,
      });

      // No need to manually update state as the onSnapshot listener will catch the change
      addToast({
        type: "success",
        title: "Status Updated",
        message: `Permit ${id} status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating permit ${id} status:`, error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update permit status. Please try again.",
      });
    }
  };

  // Handle Print/Download Permit - Generate PDF from real data
  const handlePrintPermit = async (permit: Permit) => {
    try {
      addToast({
        type: "info",
        title: "Printing Permit",
        message: `Generating print view for ${permit.name}...`,
      });

      // Get additional permit details from Firestore if needed
      const permitRef = doc(db, "permits", permit.id);
      const permitDoc = await getDoc(permitRef);

      if (!permitDoc.exists()) {
        throw new Error("Permit not found");
      }

      const permitData = permitDoc.data();

      // Generate PDF content
      const printContent = `
        WORK PERMIT
        --------------------------
        ID: ${permit.id}
        Name: ${permit.name}
        Type: ${permit.type}
        Location: ${permit.location}
        Status: ${permit.status}
        Issued To: ${permit.issuedTo}
        Issued By: ${permit.issuedBy}
        Issued Date: ${permit.issuedDate}
        Expiry Date: ${permit.expiryDate}
        --------------------------
        ${permitData.conditions ? `Conditions: ${permitData.conditions}` : "No specific conditions"}
      `;

      // Open print dialog
      const printWindow = window.open("", "_blank");
      printWindow?.document.write(`<pre>${printContent}</pre>`);
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();

      // Log the print action to Firestore
      await addDoc(collection(db, "activityLogs"), {
        type: "print_permit",
        permitId: permit.id,
        permitName: permit.name,
        userId: user?.uid,
        userName: user?.displayName,
        timestamp: serverTimestamp(),
      });

      addToast({
        type: "success",
        title: "Print Ready",
        message: `Print dialog opened for ${permit.name}.`,
      });
    } catch (error) {
      console.error(`Error printing permit ${permit.id}:`, error);
      addToast({
        type: "error",
        title: "Print Failed",
        message: "Failed to generate print view. Please try again.",
      });
    }
  };

  // Handle Edit Permit - Update in Firestore
  const handleEditPermit = async (permit: Permit) => {
    try {
      // In a real implementation, this would open an edit modal with pre-filled data
      // For now, we'll implement a simple update to demonstrate Firestore integration

      const permitRef = doc(db, "permits", permit.id);

      // Update last reviewed timestamp
      await updateDoc(permitRef, {
        lastReviewed: serverTimestamp(),
        reviewedBy: user?.displayName || "System User",
        reviewedById: user?.uid,
      });

      // Log the review action
      await addDoc(collection(db, "activityLogs"), {
        type: "review_permit",
        permitId: permit.id,
        permitName: permit.name,
        userId: user?.uid,
        userName: user?.displayName,
        timestamp: serverTimestamp(),
      });

      addToast({
        type: "success",
        title: "Permit Reviewed",
        message: `Permit ${permit.id} has been marked as reviewed.`,
      });
    } catch (error) {
      console.error(`Error updating permit ${permit.id}:`, error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update permit. Please try again.",
      });
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Active":
        return "badge-success";
      case "Pending Approval":
        return "badge-warning";
      case "Expired":
        return "badge-error";
      case "Closed":
        return "badge-info";
      case "Revoked":
        return "badge-error"; // Use error style for revoked
      default:
        return "badge-secondary";
    }
  };

  // Get stats icon class
  const getStatsIconClass = (type: keyof PermitStats): string => {
    switch (type) {
      case "active":
        return "active";
      case "pending":
        return "pending";
      case "expired":
        return "expired";
      case "closed":
        return "closed";
      case "revoked":
        return "revoked"; // Added revoked style
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-container permit-manager">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Permit Management</h1>
        <div className="dashboard-actions">
          {userRole === "admin" && (
            <button
              className="dashboard-button primary"
              onClick={() => setShowCreateModal(true)}
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
                <path d="M12 2v20m10-10H2"></path>
              </svg>
              Create Permit
            </button>
          )}
        </div>
      </div>

      {/* Filter/Search Bar */}
      <div className="filter-container">
        <div className="search-box">
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by ID, name, location, type..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="permit-type-filter">Type:</label>
          <select
            id="permit-type-filter"
            className="filter-select"
            value={selectedType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedType(e.target.value)
            }
          >
            {permitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="permit-status-filter">Status:</label>
          <select
            id="permit-status-filter"
            className="filter-select"
            value={selectedStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedStatus(e.target.value)
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Permit Table Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Work Permits</div>
        </div>
        <div className="card-content no-padding">
          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">Loading permits...</div>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-scroll-container permit-table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Permit Name</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Issued To</th>
                      <th>Issued Date</th>
                      <th>Expiry Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="empty-state">
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                              <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            <h3>No permits found</h3>
                            <p>Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPermits.map((permit) => (
                        <tr key={permit.id}>
                          <td>{permit.name}</td>
                          <td>{permit.type}</td>
                          <td>{permit.location}</td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(permit.status)}`}
                            >
                              {permit.status}
                            </span>
                          </td>
                          <td>{permit.issuedTo}</td>
                          <td>
                            {new Date(permit.issuedDate).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(permit.expiryDate).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              {/* View Button */}
                              <button
                                className="action-button tooltip"
                                onClick={() => {
                                  setSelectedPermit(permit);
                                  setShowViewModal(true);
                                }}
                                aria-label="View permit details"
                              >
                                <span className="tooltip-content">View</span>
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
                              {/* Print Button */}
                              <button
                                className="action-button tooltip"
                                onClick={() => handlePrintPermit(permit)}
                                aria-label="Print permit"
                              >
                                <span className="tooltip-content">Print</span>
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
                                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                  <rect
                                    x="6"
                                    y="14"
                                    width="12"
                                    height="8"
                                  ></rect>
                                </svg>
                              </button>
                              {/* Admin Actions */}
                              {userRole === "admin" && (
                                <>
                                  {/* Edit Button */}
                                  <button
                                    className="action-button tooltip"
                                    onClick={() => handleEditPermit(permit)}
                                    aria-label="Edit permit"
                                  >
                                    <span className="tooltip-content">
                                      Edit
                                    </span>
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
                                  {/* Revoke Button */}
                                  {permit.status === "Active" && (
                                    <button
                                      className="action-button tooltip danger"
                                      onClick={() =>
                                        handleStatusChange(permit.id, "Revoked")
                                      }
                                      aria-label="Revoke permit"
                                    >
                                      <span className="tooltip-content">
                                        Revoke
                                      </span>
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
                                        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2zm0 18a8 8 0 1 0 8-8 8 8 0 0 0-8 8z"></path>
                                        <path d="M15 9l-6 6"></path>
                                        <path d="M9 9l6 6"></path>
                                      </svg>
                                    </button>
                                  )}
                                  {/* Approve Button */}
                                  {permit.status === "Pending Approval" && (
                                    <button
                                      className="action-button tooltip success"
                                      onClick={() =>
                                        handleStatusChange(permit.id, "Active")
                                      }
                                      aria-label="Approve permit"
                                    >
                                      <span className="tooltip-content">
                                        Approve
                                      </span>
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
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                      </svg>
                                    </button>
                                  )}
                                  {/* Decline Button (Example - sets status to Revoked or a new 'Declined' status) */}
                                  {permit.status === "Pending Approval" && (
                                    <button
                                      className="action-button tooltip danger"
                                      onClick={() =>
                                        handleStatusChange(permit.id, "Revoked")
                                      }
                                      aria-label="Decline permit"
                                    >
                                      <span className="tooltip-content">
                                        Decline
                                      </span>
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
                                        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2zm0 18a8 8 0 1 0 8-8 8 8 0 0 0-8 8z"></path>
                                        <path d="M8 12h8"></path>
                                      </svg>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permit Statistics Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Permit Statistics</div>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div className="loader-container small">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="stats-grid">
              {/* Active */}
              <div className="stat-card">
                <div className={`stat-icon ${getStatsIconClass("active")}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Active Permits</div>
                  <div className="stat-value">{permitStats.active}</div>
                </div>
              </div>
              {/* Pending */}
              <div className="stat-card">
                <div className={`stat-icon ${getStatsIconClass("pending")}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Pending Approval</div>
                  <div className="stat-value">{permitStats.pending}</div>
                </div>
              </div>
              {/* Expired */}
              <div className="stat-card">
                <div className={`stat-icon ${getStatsIconClass("expired")}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M15 9l-6 6"></path>
                    <path d="M9 9l6 6"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Expired Permits</div>
                  <div className="stat-value">{permitStats.expired}</div>
                </div>
              </div>
              {/* Closed */}
              <div className="stat-card">
                <div className={`stat-icon ${getStatsIconClass("closed")}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Closed Permits</div>
                  <div className="stat-value">{permitStats.closed}</div>
                </div>
              </div>
              {/* Revoked */}
              <div className="stat-card">
                <div className={`stat-icon ${getStatsIconClass("revoked")}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M15 9l-6 6"></path>
                    <path d="M9 9l6 6"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Revoked Permits</div>
                  <div className="stat-value">{permitStats.revoked}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Permit Modal */}
      {showViewModal && selectedPermit && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{selectedPermit.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="report-details">
                <div className="detail-row">
                  <div className="detail-label">Permit ID:</div>
                  <div className="detail-value">{selectedPermit.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Type:</div>
                  <div className="detail-value">{selectedPermit.type}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Location:</div>
                  <div className="detail-value">{selectedPermit.location}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value">
                    <span
                      className={`badge ${getStatusBadgeClass(selectedPermit.status)}`}
                    >
                      {selectedPermit.status}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Issued To:</div>
                  <div className="detail-value">{selectedPermit.issuedTo}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Issued By:</div>
                  <div className="detail-value">{selectedPermit.issuedBy}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Issued Date:</div>
                  <div className="detail-value">
                    {new Date(selectedPermit.issuedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Expiry Date:</div>
                  <div className="detail-value">
                    {new Date(selectedPermit.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="report-content">
                <h3>Permit Details / Conditions</h3>
                <p>
                  Placeholder for additional permit details, conditions, or
                  associated documents.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="dashboard-button"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="dashboard-button primary"
                onClick={() => handlePrintPermit(selectedPermit)}
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
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print Permit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Permit Modal */}
      {showCreateModal && (
        <CreatePermitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePermit}
        />
      )}
    </div>
  );
};

export default PermitManager;
