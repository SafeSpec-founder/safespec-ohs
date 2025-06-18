import React, { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import FocusTrap from "focus-trap-react"; // Import FocusTrap

// Interface for Procedure (matches the one in SafetyProcedures.tsx)
interface Procedure {
  id: string;
  title: string;
  category: string;
  lastUpdated: string; // Formatted string
  status: "Active" | "Under Review" | "Archived";
  version: string;
  content: string; // Content for the viewer
}

// Define props for the component
interface SafetyProceduresViewerProps {
  procedure: Procedure | null;
  onClose?: () => void;
  // Add props for download/edit handlers if they should be triggered from here
  onDownload: (procedure: Procedure) => void;
  onEdit: (procedure: Procedure) => void;
}

const SafetyProceduresViewer: React.FC<SafetyProceduresViewerProps> = ({
  procedure,
  onClose,
  onDownload,
  onEdit,
}) => {
  const { userRole } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null); // Ref for initial focus

  // Effect to focus the close button when the modal opens
  useEffect(() => {
    if (procedure && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [procedure]); // Depend on procedure to run when modal opens

  // Handle Escape key press to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!procedure) {
    return null; // Don't render anything if no procedure is selected
  }

  return (
    // Wrap the entire modal structure in FocusTrap
    <FocusTrap
      active={!!procedure} // Activate trap when procedure is not null (modal is open)
      focusTrapOptions={{
        initialFocus: () => closeButtonRef.current || undefined, // Focus close button initially
        fallbackFocus: ".modal-content", // Fallback if initial focus fails
        onDeactivate: onClose, // Ensure trap deactivates properly on close
        clickOutsideDeactivates: true, // Allow clicking overlay to close
      }}
    >
      <div
        className="modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="procedure-viewer-title"
        aria-describedby="procedure-viewer-description"
      >
        <div
          className="modal-content large"
          onClick={(e) => e.stopPropagation()}
        >
          {" "}
          {/* Prevent closing on content click */}
          <div className="modal-header">
            <h2 id="procedure-viewer-title">{procedure.title}</h2>
            <button
              ref={closeButtonRef} // Assign ref to the close button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close procedure viewer"
            >
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Add an ID for aria-describedby */}
          <div className="modal-body" id="procedure-viewer-description">
            <div className="procedure-content-viewer">
              <div className="procedure-meta-details">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{procedure.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Version:</span>
                  <span className="meta-value">{procedure.version}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Updated:</span>
                  <span className="meta-value">{procedure.lastUpdated}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span
                    className={`meta-value badge ${procedure.status === "Active" ? "badge-success" : procedure.status === "Under Review" ? "badge-warning" : "badge-secondary"}`}
                  >
                    {procedure.status}
                  </span>
                </div>
              </div>

              <hr className="divider" />

              <div className="procedure-body-content">
                {procedure.content ? (
                  // Use dangerouslySetInnerHTML ONLY if content is trusted HTML
                  // Otherwise, use a Markdown renderer or sanitize HTML
                  <p>{procedure.content}</p>
                ) : (
                  <p>No detailed content available for this procedure.</p>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="modal-actions">
              <button
                className="dashboard-button secondary"
                onClick={() => onDownload(procedure)} // Use handler from props
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
              {userRole === "admin" && (
                <button
                  className="dashboard-button primary"
                  onClick={() => onEdit(procedure)} // Use handler from props
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Procedure
                </button>
              )}
            </div>
            <button className="dashboard-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <style>{`
          /* Styles remain the same */
          .procedure-content-viewer {}
          .procedure-meta-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
          }
          .meta-item .meta-label {
            font-weight: 500;
            color: var(--text-light);
            display: block;
            margin-bottom: 0.2rem;
          }
          .meta-item .meta-value {
            color: var(--text-color);
          }
          .divider {
            border: none;
            border-top: 1px solid var(--border-light);
            margin: 1.5rem 0;
          }
          .procedure-body-content {
            line-height: 1.6;
          }
          .modal-content.large {
            max-width: 900px;
          }
          .modal-actions svg {
            margin-right: 0.5rem;
          }
        `}</style>
      </div>
    </FocusTrap>
  );
};

export default SafetyProceduresViewer;
