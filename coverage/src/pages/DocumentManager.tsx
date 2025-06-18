import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  lastUpdated: string;
  updatedBy: string;
  status: string;
}

const DocumentManager: React.FC = () => {
  const { userRole } = useAuth();
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "Safety Procedure - Working at Heights",
      type: "Procedure",
      category: "Safety",
      lastUpdated: "May 10, 2025",
      updatedBy: "Admin User",
      status: "Active",
    },
    {
      id: "2",
      name: "Incident Report Form",
      type: "Form",
      category: "Incident Management",
      lastUpdated: "April 25, 2025",
      updatedBy: "Admin User",
      status: "Active",
    },
    {
      id: "3",
      name: "Equipment Inspection Checklist",
      type: "Checklist",
      category: "Equipment",
      lastUpdated: "May 5, 2025",
      updatedBy: "Admin User",
      status: "Active",
    },
    {
      id: "4",
      name: "Emergency Response Plan",
      type: "Plan",
      category: "Emergency",
      lastUpdated: "March 15, 2025",
      updatedBy: "Admin User",
      status: "Under Review",
    },
    {
      id: "5",
      name: "Chemical Handling Guidelines",
      type: "Guideline",
      category: "Chemical Safety",
      lastUpdated: "April 10, 2025",
      updatedBy: "Admin User",
      status: "Active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const categories = [
    "All",
    "Safety",
    "Incident Management",
    "Equipment",
    "Emergency",
    "Chemical Safety",
  ];
  const documentTypes = [
    "All",
    "Procedure",
    "Form",
    "Checklist",
    "Plan",
    "Guideline",
    "Report",
  ];

  // Filter documents based on search term, category, and type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;
    const matchesType = selectedType === "All" || doc.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleUploadDocument = () => {
    // In a real app, this would handle file upload
    // For now, just close the modal
    setShowUploadModal(false);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Document Management</h1>
        <div className="dashboard-actions">
          <button
            className="dashboard-button primary"
            onClick={() => setShowUploadModal(true)}
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
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Document
          </button>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">
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
          </button>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Documents</div>
        </div>
        <div className="card-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
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
                      <h3>No documents found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.type}</td>
                    <td>{doc.category}</td>
                    <td>{doc.lastUpdated}</td>
                    <td>
                      <span
                        className={`badge ${doc.status === "Active" ? "badge-success" : "badge-warning"}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          title="View"
                          onClick={() => console.log(`View document ${doc.id}`)}
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
                          title="Download"
                          onClick={() =>
                            console.log(`Download document ${doc.id}`)
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
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </button>
                        <button
                          className="action-button"
                          title="Edit"
                          onClick={() => console.log(`Edit document ${doc.id}`)}
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
                        {userRole === "admin" && (
                          <button
                            className="action-button"
                            title="Delete"
                            onClick={() =>
                              console.log(`Delete document ${doc.id}`)
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
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Document Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter document name"
                />
              </div>
              <div className="form-group">
                <label>Document Type</label>
                <select className="form-control">
                  {documentTypes
                    .filter((type) => type !== "All")
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control">
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>File</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="document-file"
                    className="file-input"
                  />
                  <label htmlFor="document-file" className="file-label">
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Choose a file</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter document description"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUploadDocument}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #888;
        }
        
        .empty-state svg {
          margin-bottom: 1rem;
          color: #ccc;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .file-upload {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        
        .file-input {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        
        .file-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: #f5f5f5;
          border: 1px dashed #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .file-label:hover {
          background-color: #eee;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #888;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};

export default DocumentManager;
