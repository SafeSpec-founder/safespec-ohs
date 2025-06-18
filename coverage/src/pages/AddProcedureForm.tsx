import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext"; // Assuming ToastContext is in components

const AddProcedureForm: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Placeholder categories - fetch from backend in real app
  const categories = [
    "Emergency Response",
    "Hazardous Materials",
    "Equipment Safety",
    "Personal Safety",
    "Workplace Safety",
    "Reporting",
    "Other",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic validation (e.g., PDF type)
      if (selectedFile.type !== "application/pdf") {
        addToast({
          type: "error",
          title: "Invalid File Type",
          message: "Please upload a PDF file.",
          duration: 5000,
        });
        setFile(null);
        e.target.value = ""; // Clear the input
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !category || !version || !file) {
      addToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all fields and select a PDF file.",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call / backend processing
    addToast({
      type: "info",
      title: "Submitting Procedure",
      message: "Uploading procedure details and file...",
      duration: 2000,
    });

    setTimeout(() => {
      // In a real app: upload file to storage, save metadata to database
      console.log("Simulating procedure submission:", {
        title,
        category,
        version,
        fileName: file.name,
      });

      addToast({
        type: "success",
        title: "Procedure Added",
        message: `Procedure "${title}" has been successfully added.`,
        duration: 4000,
      });
      setIsSubmitting(false);
      // Navigate back to the procedures list after successful submission
      navigate("/safety-procedures");
    }, 2500);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Add New Safety Procedure</h1>
        <div className="dashboard-actions">
          <button
            className="dashboard-button"
            onClick={() => navigate("/safety-procedures")} // Go back button
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
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Procedures
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-content">
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Form Title */}
            <div className="form-group full-width">
              <label htmlFor="procedureTitle">Procedure Title</label>
              <input
                type="text"
                id="procedureTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of the procedure"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Category Dropdown */}
            <div className="form-group half-width">
              <label htmlFor="procedureCategory">Category</label>
              <select
                id="procedureCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Version Input */}
            <div className="form-group half-width">
              <label htmlFor="procedureVersion">Version</label>
              <input
                type="text"
                id="procedureVersion"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., v1.0, v2.1a"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload */}
            <div className="form-group full-width">
              <label htmlFor="procedureFile">Procedure Document (PDF)</label>
              <input
                type="file"
                id="procedureFile"
                accept=".pdf" // Enforce PDF only
                onChange={handleFileChange}
                required
                disabled={isSubmitting}
              />
              {file && <p className="file-info">Selected file: {file.name}</p>}
            </div>

            {/* Submission Button */}
            <div className="form-actions full-width">
              <button
                type="submit"
                className="dashboard-button primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Submitting...
                  </>
                ) : (
                  <>
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
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Add Procedure
                  </>
                )}
              </button>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => navigate("/safety-procedures")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProcedureForm;
