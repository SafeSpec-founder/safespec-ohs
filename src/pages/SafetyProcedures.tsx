import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import SafetyProceduresViewer from "./SafetyProceduresViewer";
import { db } from "../config/firebase"; // Import Firestore instance
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  // deleteDoc, // For potential delete functionality - Commented out to fix TS6133
  Timestamp as FirestoreTimestamp, // Import Timestamp if using it in your data
} from "firebase/firestore";
import { jsPDF } from "jspdf"; // Basic PDF generation
import "jspdf-autotable"; // For table generation in PDF

// Extend jsPDF with autoTable typings (if using TypeScript)
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Interface for Safety Procedure from Firestore
interface Procedure {
  id: string; // Firestore document ID
  title: string;
  category: string;
  lastUpdated: string; // Use string for consistency with SafetyProceduresViewer
  status: "Active" | "Under Review" | "Archived";
  version: string;
  content: string; // Full content (e.g., Markdown or HTML)
  // Add any other relevant fields from your Firestore documents
}

// Interface for Procedure Category (assuming fetched or static)
interface ProcedureCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  count: number;
}

// Interface for Procedure Update (assuming fetched or static)
interface ProcedureUpdate {
  id: string;
  title: string;
  user: string;
  time: string;
}

// Interface for raw Firestore data
interface FirestoreProcedureData {
  title: string;
  category: string;
  lastUpdated: FirestoreTimestamp | string;
  status: "Active" | "Under Review" | "Archived";
  version: string;
  content: string;
  [key: string]: any; // For any other fields
}

const SafetyProcedures: React.FC = () => {
  const { addToast } = useToast();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(
    null,
  );
  const [showProcedureModal, setShowProcedureModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // --- Static Data (Categories, Updates - Replace with Firestore if needed) ---
  const [procedureCategories] = useState<ProcedureCategory[]>([
    {
      id: "cat-1",
      name: "Emergency Response",
      icon: "🚨",
      description: "Handling emergencies",
      count: 0,
    }, // Counts will update dynamically
    {
      id: "cat-2",
      name: "Hazardous Materials",
      icon: "☣️",
      description: "Chemical safety",
      count: 0,
    },
    {
      id: "cat-3",
      name: "Equipment Safety",
      icon: "⚙️",
      description: "Machine operation",
      count: 0,
    },
    {
      id: "cat-4",
      name: "Personal Safety",
      icon: "👷",
      description: "PPE and practices",
      count: 0,
    },
    {
      id: "cat-5",
      name: "Workplace Safety",
      icon: "🏢",
      description: "General site safety",
      count: 0,
    },
    {
      id: "cat-6",
      name: "Reporting",
      icon: "📊",
      description: "Incident reporting",
      count: 0,
    },
  ]);

  const [procedureUpdates] = useState<ProcedureUpdate[]>([
    // Replace with dynamic updates from Firestore if needed
    {
      id: "upd-1",
      title: "Emergency Evacuation Procedure updated",
      user: "System",
      time: "May 25, 2025",
    },
    {
      id: "upd-2",
      title: "Chemical Handling Guidelines updated",
      user: "System",
      time: "May 24, 2025",
    },
  ]);
  // --- End Static Data ---

  // Fetch Procedures from Firestore
  useEffect(() => {
    setIsLoading(true);
    const proceduresCollection = collection(db, "safetyProcedures");
    // Order by title or lastUpdated
    const q = query(proceduresCollection, orderBy("title", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedProcedures: Procedure[] = [];
        const categoryCounts: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreProcedureData;
          // Convert Firestore Timestamp to string for consistency
          let lastUpdated = "Unknown date";

          if (
            typeof data.lastUpdated === "object" &&
            data.lastUpdated !== null
          ) {
            if ("toDate" in data.lastUpdated) {
              lastUpdated = data.lastUpdated.toDate().toLocaleDateString();
            }
          } else if (typeof data.lastUpdated === "string") {
            lastUpdated = data.lastUpdated;
          }

          fetchedProcedures.push({
            id: doc.id,
            title: data.title,
            category: data.category,
            status: data.status,
            version: data.version,
            content: data.content,
            lastUpdated: lastUpdated,
          });

          // Update category counts
          categoryCounts[data.category] =
            (categoryCounts[data.category] || 0) + 1;
        });

        setProcedures(fetchedProcedures);
        // Update category counts in state (if needed for display)
        // setProcedureCategories(prev => prev.map(cat => ({ ...cat, count: categoryCounts[cat.name] || 0 })));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching safety procedures: ", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Could not load safety procedures.",
        });
        setIsLoading(false);
      },
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [addToast]);

  const filteredProcedures = procedures.filter((procedure) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      procedure.title.toLowerCase().includes(lowerSearchTerm) ||
      procedure.category.toLowerCase().includes(lowerSearchTerm) ||
      procedure.id.toLowerCase().includes(lowerSearchTerm) ||
      procedure.status.toLowerCase().includes(lowerSearchTerm) ||
      procedure.version.toLowerCase().includes(lowerSearchTerm);

    const matchesCategory =
      filterCategory === "all" || procedure.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleViewProcedure = (procedure: Procedure) => {
    // Ensure content is available before showing modal
    // If content is large, you might fetch it on demand here
    if (!procedure.content) {
      addToast({
        type: "info",
        title: "Loading Content",
        message: "Fetching procedure details...",
      });
      // Example: Fetch content if not already loaded
      const procedureDocRef = doc(db, "safetyProcedures", procedure.id);
      getDoc(procedureDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreProcedureData;
            let lastUpdated = "Unknown date";

            if (
              typeof data.lastUpdated === "object" &&
              data.lastUpdated !== null
            ) {
              if ("toDate" in data.lastUpdated) {
                lastUpdated = data.lastUpdated.toDate().toLocaleDateString();
              }
            } else if (typeof data.lastUpdated === "string") {
              lastUpdated = data.lastUpdated;
            }

            const fullProcedure: Procedure = {
              id: docSnap.id,
              title: data.title,
              category: data.category,
              status: data.status,
              version: data.version,
              content: data.content,
              lastUpdated: lastUpdated,
            };

            setSelectedProcedure(fullProcedure);
            setShowProcedureModal(true);
          } else {
            addToast({
              type: "error",
              title: "Error",
              message: "Could not load procedure content.",
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching procedure content: ", error);
          addToast({
            type: "error",
            title: "Error",
            message: "Could not load procedure content.",
          });
        });
    } else {
      setSelectedProcedure(procedure);
      setShowProcedureModal(true);
    }
  };

  const handleDownloadProcedure = (procedure: Procedure) => {
    addToast({
      type: "info",
      title: "Generating PDF",
      message: `Preparing ${procedure.title} for download...`,
      duration: 2000,
    });

    try {
      const doc = new jsPDF();

      // --- Basic PDF Content ---
      doc.setFontSize(18);
      doc.text(procedure.title, 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`ID: ${procedure.id}`, 14, 30);
      doc.text(`Version: ${procedure.version}`, 14, 36);
      doc.text(`Status: ${procedure.status}`, 14, 42);
      doc.text(`Category: ${procedure.category}`, 14, 48);
      doc.text(`Last Updated: ${procedure.lastUpdated}`, 14, 54);

      doc.setLineWidth(0.5);
      doc.line(14, 60, 196, 60); // Horizontal line

      doc.setFontSize(12);
      doc.setTextColor(0);
      // Add procedure content - basic text wrapping
      // For complex HTML/Markdown, use WeasyPrint/xhtml2pdf via backend/shell
      const splitContent = doc.splitTextToSize(
        procedure.content || "No content available.",
        180,
      );
      doc.text(splitContent, 14, 70);

      // --- End Basic PDF Content ---

      // Save the PDF
      doc.save(`${procedure.title.replace(/\s+/g, "_")}_${procedure.id}.pdf`);

      addToast({
        type: "success",
        title: "Download Ready",
        message: `${procedure.title} PDF generated.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating PDF: ", error);
      addToast({
        type: "error",
        title: "PDF Generation Failed",
        message: "Could not generate the PDF document.",
        duration: 4000,
      });
    }
  };

  const handleEditProcedure = (procedure: Procedure) => {
    // Navigate to an edit page/route, passing the procedure ID
    // navigate(`/procedures/edit/${procedure.id}`);
    addToast({
      type: "info",
      title: "Edit Procedure",
      message: `Edit functionality for ${procedure.title} is not implemented yet.`,
      duration: 3000,
    });
  };

  const handleAddProcedure = () => {
    // navigate('/procedures/add'); // Navigate to the Add Procedure form/page
    addToast({
      type: "info",
      title: "Add Procedure",
      message: "Add procedure functionality is not implemented yet.",
      duration: 3000,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category: string) => {
    setFilterCategory(category);
    addToast({
      type: "info",
      title: "Filter Applied",
      message:
        category === "all"
          ? "Showing all procedures"
          : `Filtering by category: ${category}`,
      duration: 2000,
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Active":
        return "badge-success";
      case "Under Review":
        return "badge-warning";
      case "Archived":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  const closeProcedureModal = useCallback(() => {
    setShowProcedureModal(false);
    setTimeout(() => setSelectedProcedure(null), 300);
  }, []);

  // --- Placeholder CRUD for Categories (Keep as is or implement with Firestore) ---
  const handleAddCategory = () => {
    addToast({
      type: "info",
      title: "Add Category",
      message: "Functionality not implemented yet.",
    });
  };
  const handleEditCategory = (categoryId: string) => {
    addToast({
      type: "info",
      title: "Edit Category",
      message: `Edit category ${categoryId} - Functionality not implemented yet.`,
    });
  };
  const handleDeleteCategory = (categoryId: string) => {
    addToast({
      type: "info",
      title: "Delete Category",
      message: `Delete category ${categoryId} - Functionality not implemented yet.`,
    });
  };
  // --- End Placeholder CRUD ---

  return (
    <div className="dashboard-container safety-procedures-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Safety Procedures</h1>
        <div className="dashboard-actions">
          <button
            className="dashboard-button primary"
            onClick={handleAddProcedure}
          >
            {/* SVG Icon */}
            Add Procedure
          </button>
        </div>
      </div>

      {/* Filter/Search Bar */}
      <div className="filter-container">
        <div className="search-box">
          {/* SVG Icon */}
          <label htmlFor="procedureSearch" className="sr-only">
            Search Procedures
          </label>
          <input
            id="procedureSearch"
            type="search"
            placeholder="Search by ID, title, category, status..."
            value={searchTerm}
            onChange={handleSearch}
            aria-controls="procedures-table"
          />
        </div>
        <div className="filter-box">
          <label htmlFor="categoryFilter">Filter by Category:</label>
          <select
            id="categoryFilter"
            value={filterCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {procedureCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Procedures Table Card */}
      <div className="dashboard-card">
        <div className="card-content no-padding">
          <div aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <div className="loader-text">Loading procedures...</div>
              </div>
            ) : (
              <>
                {filteredProcedures.length === 0 ? (
                  <div className="empty-state" style={{ padding: "2rem" }}>
                    {/* SVG Icon */}
                    <h3>No procedures found</h3>
                    <p>
                      No procedures match your current search term "{searchTerm}
                      "
                      {filterCategory !== "all"
                        ? ` and category "${filterCategory}"`
                        : ""}
                      .
                    </p>
                    <button
                      className="dashboard-button"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterCategory("all");
                      }}
                    >
                      Clear Search & Filters
                    </button>
                  </div>
                ) : (
                  <div ref={tableContainerRef} className="table-container">
                    <div
                      className="table-scroll-container"
                      style={{
                        maxHeight: "calc(10 * 55px)",
                        overflowY: "auto",
                      }}
                    >
                      {" "}
                      {/* Adjust max height */}
                      <table id="procedures-table" className="data-table">
                        <caption className="sr-only">
                          List of Safety Procedures
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Procedure Title</th>
                            <th scope="col">Category</th>
                            <th scope="col">Version</th>
                            <th scope="col">Last Updated</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProcedures.map((procedure) => (
                            <tr key={procedure.id}>
                              <td>{procedure.id}</td>
                              <td>{procedure.title}</td>
                              <td>{procedure.category}</td>
                              <td>{procedure.version}</td>
                              <td>{procedure.lastUpdated}</td>
                              <td>
                                <span
                                  className={`badge ${getStatusBadgeClass(procedure.status)}`}
                                >
                                  {procedure.status}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-button"
                                    onClick={() =>
                                      handleViewProcedure(procedure)
                                    }
                                    aria-label={`View ${procedure.title}`}
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
                                  <button
                                    className="action-button"
                                    onClick={() =>
                                      handleDownloadProcedure(procedure)
                                    }
                                    aria-label={`Download ${procedure.title}`}
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
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <polyline points="7 10 12 15 17 10"></polyline>
                                      <line
                                        x1="12"
                                        y1="15"
                                        x2="12"
                                        y2="3"
                                      ></line>
                                    </svg>
                                  </button>
                                  <button
                                    className="action-button"
                                    onClick={() =>
                                      handleEditProcedure(procedure)
                                    }
                                    aria-label={`Edit ${procedure.title}`}
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
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Categories Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Procedure Categories</div>
          <div className="card-actions">
            <button
              className="dashboard-button small"
              onClick={handleAddCategory}
              aria-label="Add new category"
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
              Add Category
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="category-grid">
            {procedureCategories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <div className="category-details">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="category-actions">
                    <button
                      className="action-button small"
                      onClick={() => handleCategoryFilter(category.name)}
                      aria-label={`Filter by ${category.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      Filter
                    </button>
                    <button
                      className="action-button small"
                      onClick={() => handleEditCategory(category.id)}
                      aria-label={`Edit ${category.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
                      Edit
                    </button>
                    <button
                      className="action-button small"
                      onClick={() => handleDeleteCategory(category.id)}
                      aria-label={`Delete ${category.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Updates Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Recent Updates</div>
        </div>
        <div className="card-content">
          <div className="updates-list">
            {procedureUpdates.map((update) => (
              <div key={update.id} className="update-item">
                <div className="update-icon">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="update-details">
                  <div className="update-title">{update.title}</div>
                  <div className="update-meta">
                    <span className="update-user">{update.user}</span>
                    <span className="update-time">{update.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Procedure Viewer Modal */}
      {showProcedureModal && selectedProcedure && (
        <div className="modal-overlay">
          <div className="modal-container large">
            <div className="modal-header">
              <h2>{selectedProcedure.title}</h2>
              <button
                className="modal-close"
                onClick={closeProcedureModal}
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
            <div className="modal-content">
              <SafetyProceduresViewer
                procedure={selectedProcedure}
                onDownload={handleDownloadProcedure}
                onEdit={handleEditProcedure}
              />
            </div>
            <div className="modal-footer">
              <button
                className="dashboard-button"
                onClick={closeProcedureModal}
              >
                Close
              </button>
              <button
                className="dashboard-button primary"
                onClick={() => handleDownloadProcedure(selectedProcedure)}
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyProcedures;
