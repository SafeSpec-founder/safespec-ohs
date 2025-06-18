import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext"; // Assuming ToastContext is in components

// Interface for Equipment
interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status:
    | "Available"
    | "In Use"
    | "Maintenance"
    | "Out of Service"
    | "Inspection Due";
  lastInspection: string;
  nextInspection: string;
  document?: string; // Optional property
}

// Interface for Add/Edit Equipment Modal Props
interface EquipmentModalProps {
  onClose?: () => void;
  onSave: (equipmentData: Omit<Equipment, "id">) => void;
  equipment?: Equipment | null; // Pass existing equipment for editing
}

// --- Add/Edit Equipment Modal Component ---
const EquipmentModal: React.FC<EquipmentModalProps> = ({
  onClose,
  onSave,
  equipment,
}) => {
  const [name, setName] = useState(equipment?.name || "");
  const [type, setType] = useState(
    equipment?.type || "Personal Protective Equipment",
  );
  const [location, setLocation] = useState(equipment?.location || "");
  const [status, setStatus] = useState<Equipment["status"]>(
    equipment?.status || "Available",
  );
  const [lastInspection, setLastInspection] = useState(
    equipment?.lastInspection || new Date().toISOString().split("T")[0],
  );
  const [nextInspection, setNextInspection] = useState(
    equipment?.nextInspection || "",
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { addToast } = useToast();

  const equipmentTypes = [
    "Personal Protective Equipment",
    "Fire Safety",
    "Monitoring Equipment",
    "Medical Equipment",
    "Tools",
    "Vehicles",
  ];
  const statusOptions: Equipment["status"][] = [
    "Available",
    "In Use",
    "Maintenance",
    "Out of Service",
    "Inspection Due",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !type ||
      !location ||
      !status ||
      !lastInspection ||
      !nextInspection
    ) {
      addToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      });
      return;
    }
    if (new Date(nextInspection) <= new Date(lastInspection)) {
      addToast({
        type: "error",
        title: "Invalid Dates",
        message: "Next inspection date must be after last inspection date.",
      });
      return;
    }

    // Fix for TS2375 with exactOptionalPropertyTypes
    // Create base object without optional properties first
    const baseData: Omit<Equipment, "id" | "document"> & { document?: string } =
      {
        name,
        type,
        location,
        status,
        lastInspection: new Date(lastInspection).toLocaleDateString("en-CA"),
        nextInspection: new Date(nextInspection).toLocaleDateString("en-CA"),
      };

    // Determine the document value
    const documentValue = documentFile
      ? documentFile.name
      : equipment?.document;

    // Only add the document property if it has a string value
    if (typeof documentValue === "string" && documentValue.length > 0) {
      baseData.document = documentValue;
    }

    // Final data object conforming to Omit<Equipment, 'id'>
    const equipmentData: Omit<Equipment, "id"> = baseData;

    // In a real app, handle file upload here if documentFile exists
    console.log(
      "Saving equipment:",
      equipmentData,
      "Document File:",
      documentFile?.name,
    );
    addToast({
      type: "info",
      title: "Saving Equipment",
      message: `Saving ${equipment ? "changes to" : "new"} equipment...`,
    });

    // Simulate save
    setTimeout(() => {
      onSave(equipmentData);
      // Toast moved to handleSaveEquipment in parent
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{equipment ? "Edit Equipment" : "Add New Equipment"}</h2>
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
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
                  <label htmlFor="equipmentName">Equipment Name *</label>
                  <input
                    type="text"
                    id="equipmentName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="equipmentType">Type *</label>
                  <select
                    id="equipmentType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    {equipmentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="equipmentLocation">Location *</label>
                  <input
                    type="text"
                    id="equipmentLocation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Column 2 */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="equipmentStatus">Status *</label>
                  <select
                    id="equipmentStatus"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as Equipment["status"])
                    }
                    required
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="lastInspection">Last Inspection Date *</label>
                  <input
                    type="date"
                    id="lastInspection"
                    value={lastInspection}
                    onChange={(e) => setLastInspection(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nextInspection">Next Inspection Date *</label>
                  <input
                    type="date"
                    id="nextInspection"
                    value={nextInspection}
                    onChange={(e) => setNextInspection(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            {/* Full width row for document upload */}
            <div className="form-group full-width">
              <label htmlFor="documentUpload">
                Attach Document (e.g., Manual, Certificate)
              </label>
              <input
                type="file"
                id="documentUpload"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              {documentFile && (
                <p className="file-name">Selected: {documentFile.name}</p>
              )}
              {!documentFile && equipment?.document && (
                <p className="file-name">Current: {equipment.document}</p>
              )}
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
              {equipment ? "Save Changes" : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Equipment Manager Component ---
const EquipmentManager: React.FC = () => {
  const { userRole } = useAuth();
  const { addToast } = useToast();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    const mockEquipment: Equipment[] = [
      {
        id: "EQ1",
        name: "Safety Harness #A123",
        type: "Personal Protective Equipment",
        location: "Main Warehouse",
        status: "Available",
        lastInspection: "2025-05-10",
        nextInspection: "2025-06-10",
        document: "harness_manual.pdf",
      },
      {
        id: "EQ2",
        name: "Fire Extinguisher #F456",
        type: "Fire Safety",
        location: "Building A, Floor 2",
        status: "Available",
        lastInspection: "2025-04-15",
        nextInspection: "2025-07-15",
      },
      {
        id: "EQ3",
        name: "Gas Detector #G789",
        type: "Monitoring Equipment",
        location: "Chemical Storage",
        status: "Maintenance",
        lastInspection: "2025-05-05",
        nextInspection: "2025-06-05",
      },
      {
        id: "EQ4",
        name: "First Aid Kit #FA101",
        type: "Medical Equipment",
        location: "Building B, Floor 1",
        status: "Inspection Due",
        lastInspection: "2025-05-01",
        nextInspection: "2025-06-01",
      },
      {
        id: "EQ5",
        name: "Respirator #R202",
        type: "Personal Protective Equipment",
        location: "Main Warehouse",
        status: "In Use",
        lastInspection: "2025-04-20",
        nextInspection: "2025-05-20",
      },
      {
        id: "EQ6",
        name: "Forklift #FL01",
        type: "Vehicles",
        location: "Loading Bay 1",
        status: "Available",
        lastInspection: "2025-05-18",
        nextInspection: "2025-11-18",
      },
      {
        id: "EQ7",
        name: "Welding Machine #WM02",
        type: "Tools",
        location: "Workshop A",
        status: "Out of Service",
        lastInspection: "2025-03-01",
        nextInspection: "2025-09-01",
      },
      {
        id: "EQ8",
        name: "Safety Goggles #SG500 (Box)",
        type: "Personal Protective Equipment",
        location: "PPE Cabinet 3",
        status: "Available",
        lastInspection: "2025-05-01",
        nextInspection: "2026-05-01",
      },
    ];
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEquipmentList(mockEquipment);
      setIsLoading(false);
    }, 800);
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );

  const equipmentTypes = [
    "All",
    "Personal Protective Equipment",
    "Fire Safety",
    "Monitoring Equipment",
    "Medical Equipment",
    "Tools",
    "Vehicles",
  ];
  const statusOptions: (Equipment["status"] | "All")[] = [
    "All",
    "Available",
    "In Use",
    "Maintenance",
    "Out of Service",
    "Inspection Due",
  ];

  // Filter equipment based on search term, type, and status
  const filteredEquipment = equipmentList.filter((item) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.location.toLowerCase().includes(lowerSearchTerm) ||
      item.id.toLowerCase().includes(lowerSearchTerm);
    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle Add/Edit Equipment Save
  const handleSaveEquipment = (equipmentData: Omit<Equipment, "id">) => {
    if (editingEquipment) {
      // Edit existing equipment
      setEquipmentList(
        equipmentList.map((item) =>
          item.id === editingEquipment.id
            ? { ...item, ...equipmentData }
            : item,
        ),
      );
      addToast({
        type: "success",
        title: "Update Successful",
        message: `Equipment '${equipmentData.name}' updated.`,
      });
    } else {
      // Add new equipment
      const newEquipment: Equipment = {
        id: `EQ-${Date.now()}`,
        ...equipmentData,
      };
      setEquipmentList([...equipmentList, newEquipment]);
      addToast({
        type: "success",
        title: "Equipment Added",
        message: `Equipment '${equipmentData.name}' added.`,
      });
    }
    setShowModal(false);
    setEditingEquipment(null);
  };

  // Handle View Action (Placeholder - could open a detail modal or panel)
  const handleViewEquipment = (equipment: Equipment) => {
    addToast({
      type: "info",
      title: "View Equipment",
      message: `Viewing details for ${equipment.name}.`,
    });
    // Implement detail view logic here (e.g., open a read-only modal)
    setEditingEquipment(equipment); // Re-use modal in read-only mode or create separate view
    setShowModal(true); // For now, just opens the edit modal
  };

  // Handle Edit Action
  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowModal(true);
  };

  // Handle Delete Action (Admin only)
  const handleDeleteEquipment = (id: string, name: string) => {
    // Confirmation dialog recommended here
    // Used 'id' parameter in toast message (TS6133 Fix)
    addToast({
      type: "warning",
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${name} (ID: ${id})? (Deletion not implemented)`,
    });
    // In a real app, call API to delete
    // setEquipmentList(equipmentList.filter(item => item.id !== id));
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Equipment["status"]): string => {
    switch (status) {
      case "Available":
        return "badge-success";
      case "In Use":
        return "badge-info";
      case "Maintenance":
        return "badge-warning";
      case "Inspection Due":
        return "badge-warning";
      case "Out of Service":
        return "badge-error";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="dashboard-container equipment-manager">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Equipment Management</h1>
        <div className="dashboard-actions">
          {userRole === "admin" && (
            <button
              className="dashboard-button primary"
              onClick={() => {
                setEditingEquipment(null);
                setShowModal(true);
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Filter/Search Bar - Improved Layout */}
      <div className="filter-container">
        <div className="search-box flex-grow">
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
            placeholder="Search by ID, name, location..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="equipment-type-filter">Type:</label>
          <select
            id="equipment-type-filter"
            className="filter-select"
            value={selectedType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedType(e.target.value)
            }
          >
            {equipmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="equipment-status-filter">Status:</label>
          <select
            id="equipment-status-filter"
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

      {/* Main Equipment Table Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Equipment Inventory</div>
        </div>
        <div className="card-content no-padding">
          {isLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">Loading equipment...</div>
            </div>
          ) : (
            <div className="table-container">
              {/* Apply scrolling if needed, similar to reports */}
              <div className="table-scroll-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Last Inspection</th>
                      <th>Next Inspection</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.location}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{item.lastInspection}</td>
                        <td>{item.nextInspection}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button tooltip"
                              onClick={() => handleViewEquipment(item)}
                              aria-label="View equipment details"
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
                            {userRole === "admin" && (
                              <>
                                <button
                                  className="action-button tooltip"
                                  onClick={() => handleEditEquipment(item)}
                                  aria-label="Edit equipment"
                                >
                                  <span className="tooltip-content">Edit</span>
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
                                  className="action-button tooltip danger"
                                  onClick={() =>
                                    handleDeleteEquipment(item.id, item.name)
                                  }
                                  aria-label="Delete equipment"
                                >
                                  <span className="tooltip-content">
                                    Delete
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
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line
                                      x1="10"
                                      y1="11"
                                      x2="10"
                                      y2="17"
                                    ></line>
                                    <line
                                      x1="14"
                                      y1="11"
                                      x2="14"
                                      y2="17"
                                    ></line>
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <EquipmentModal
          onClose={() => {
            setShowModal(false);
            setEditingEquipment(null);
          }}
          onSave={handleSaveEquipment}
          equipment={editingEquipment}
        />
      )}

      {/* Add specific styles */}
      <style>{`
        .equipment-manager .filter-container {
          display: flex;
          flex-wrap: wrap; /* Allow wrapping on smaller screens */
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }
        .equipment-manager .search-box {
          display: flex;
          align-items: center;
          background-color: var(--background-alt);
          padding: 0.5rem 0.75rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          flex-grow: 1; /* Allow search box to grow */
        }
        .equipment-manager .search-box svg {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }
        .equipment-manager .search-box input {
          border: none;
          background: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
        }
        .equipment-manager .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .equipment-manager .filter-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .equipment-manager .filter-select {
          padding: 0.5rem 0.75rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          background-color: var(--background-alt);
          color: var(--text-primary);
          min-width: 150px; /* Ensure dropdowns have a minimum width */
        }
        .equipment-manager .table-scroll-container {
          width: 100%;
          overflow-x: auto; /* Add horizontal scroll if needed */
        }
        .form-grid.two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .form-group.full-width {
          grid-column: 1 / -1; /* Span across both columns */
        }
        .file-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default EquipmentManager;
