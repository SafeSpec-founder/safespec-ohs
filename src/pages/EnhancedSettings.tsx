import React, { useState } from "react";
import { logger } from "../utils/logger";
import { useAuth } from "../contexts/AuthContext";

interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  sms: boolean;
  desktop: boolean;
}

interface LanguageOption {
  value: string;
  label: string;
}

interface DataRetentionOption {
  value: string;
  label: string;
}

interface RefreshRateOption {
  value: string;
  label: string;
}

const EnhancedSettings: React.FC = () => {
  const { userRole } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("english");
  const [dataRetention, setDataRetention] = useState<string>("90days");
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email: true,
      inApp: true,
      sms: false,
      desktop: true,
    });
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [showPerformanceMetrics, setShowPerformanceMetrics] =
    useState<boolean>(true);
  const [metricRefreshRate, setMetricRefreshRate] = useState<string>("hourly");

  const languages: LanguageOption[] = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
  ];

  const dataRetentionOptions: DataRetentionOption[] = [
    { value: "30days", label: "30 Days" },
    { value: "90days", label: "90 Days" },
    { value: "1year", label: "1 Year" },
    { value: "3years", label: "3 Years" },
    { value: "never", label: "Never Delete" },
  ];

  const refreshRateOptions: RefreshRateOption[] = [
    { value: "realtime", label: "Real-time" },
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
  ];

  // Toggle dark mode
  const handleDarkModeToggle = (): void => {
    setDarkMode(!darkMode);
    // In a real app, this would update the theme across the application
    document.body.classList.toggle("dark-mode");
  };

  // Handle language change
  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setLanguage(e.target.value);
    // In a real app, this would update the language across the application
  };

  // Handle data retention change
  const handleDataRetentionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const newValue = e.target.value;

    // If changing to "Never Delete", show confirmation modal
    if (newValue === "never") {
      setConfirmAction(() => () => setDataRetention(newValue));
      setShowConfirmModal(true);
    } else {
      setDataRetention(newValue);
    }
  };

  // Handle notification setting toggle
  const handleNotificationToggle = (type: keyof NotificationSettings): void => {
    setNotificationSettings({
      ...notificationSettings,
      [type]: !notificationSettings[type],
    });
  };

  // Handle auto-save toggle
  const handleAutoSaveToggle = (): void => {
    setAutoSave(!autoSave);
  };

  // Handle performance metrics toggle
  const handlePerformanceMetricsToggle = (): void => {
    setShowPerformanceMetrics(!showPerformanceMetrics);
  };

  // Handle metric refresh rate change
  const handleRefreshRateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setMetricRefreshRate(e.target.value);
  };

  // Handle export data
  const handleExportData = (): void => {
    logger.info("Exporting user data...");
    // In a real app, this would trigger a data export process
  };

  // Handle account deletion
  const handleDeleteAccount = (): void => {
    setConfirmAction(() => () => logger.info("Deleting account..."));
    setShowConfirmModal(true);
  };

  // Confirm action
  const confirmActionHandler = (): void => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  return (
    <div className={`settings-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Settings</h1>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <div className="card-title">Appearance</div>
          </div>
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-label">
                <span>Dark Mode</span>
                <span className="setting-description">
                  Switch between light and dark themes
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>Language</span>
                <span className="setting-description">
                  Select your preferred language
                </span>
              </div>
              <div className="setting-control">
                <select
                  className="form-control"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <div className="card-title">Notifications</div>
          </div>
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-label">
                <span>Email Notifications</span>
                <span className="setting-description">
                  Receive notifications via email
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.email}
                    onChange={() => handleNotificationToggle("email")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>In-App Notifications</span>
                <span className="setting-description">
                  Receive notifications within the app
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inApp}
                    onChange={() => handleNotificationToggle("inApp")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>SMS Notifications</span>
                <span className="setting-description">
                  Receive notifications via SMS
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms}
                    onChange={() => handleNotificationToggle("sms")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>Desktop Notifications</span>
                <span className="setting-description">
                  Receive notifications on your desktop
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.desktop}
                    onChange={() => handleNotificationToggle("desktop")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <div className="card-title">Data & Privacy</div>
          </div>
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-label">
                <span>Data Retention</span>
                <span className="setting-description">
                  How long to keep your data
                </span>
              </div>
              <div className="setting-control">
                <select
                  className="form-control"
                  value={dataRetention}
                  onChange={handleDataRetentionChange}
                >
                  {dataRetentionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>Auto-Save</span>
                <span className="setting-description">
                  Automatically save changes
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={handleAutoSaveToggle}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>Export Your Data</span>
                <span className="setting-description">
                  Download a copy of your data
                </span>
              </div>
              <div className="setting-control">
                <button
                  className="btn btn-secondary"
                  onClick={handleExportData}
                >
                  Export
                </button>
              </div>
            </div>

            {userRole === "admin" && (
              <div className="setting-item">
                <div className="setting-label">
                  <span>Delete Account</span>
                  <span className="setting-description">
                    Permanently delete your account and data
                  </span>
                </div>
                <div className="setting-control">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <div className="card-title">Performance Metrics</div>
          </div>
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-label">
                <span>Show Performance Metrics</span>
                <span className="setting-description">
                  Display safety performance metrics on dashboard
                </span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showPerformanceMetrics}
                    onChange={handlePerformanceMetricsToggle}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>Metrics Refresh Rate</span>
                <span className="setting-description">
                  How often to update performance metrics
                </span>
              </div>
              <div className="setting-control">
                <select
                  className="form-control"
                  value={metricRefreshRate}
                  onChange={handleRefreshRateChange}
                  disabled={!showPerformanceMetrics}
                >
                  {refreshRateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="metrics-preview">
              <h3>Performance Metrics Preview</h3>
              <div className="metrics-grid">
                <div className="metric-preview-item">
                  <div className="metric-icon">
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
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-name">Incident Rate</div>
                    <div className="metric-value">
                      1.2 <span className="trend positive">-0.3</span>
                    </div>
                  </div>
                </div>

                <div className="metric-preview-item">
                  <div className="metric-icon">
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
                  <div className="metric-content">
                    <div className="metric-name">Safety Score</div>
                    <div className="metric-value">
                      92% <span className="trend positive">+2%</span>
                    </div>
                  </div>
                </div>

                <div className="metric-preview-item">
                  <div className="metric-icon">
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
                      <rect
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-name">Equipment Compliance</div>
                    <div className="metric-value">
                      98% <span className="trend positive">+1%</span>
                    </div>
                  </div>
                </div>

                <div className="metric-preview-item">
                  <div className="metric-icon">
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
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-name">Training Completion</div>
                    <div className="metric-value">
                      87% <span className="trend negative">-3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Confirm Action</h2>
              <button
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to proceed with this action?</p>
              <p>
                This change may have significant implications for your data.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmActionHandler}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-page {
          padding: 1rem;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .settings-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .setting-item:last-child {
          border-bottom: none;
        }
        
        .setting-label {
          display: flex;
          flex-direction: column;
        }
        
        .setting-description {
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.25rem;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #1890ff;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .metrics-preview {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f0f0f0;
        }
        
        .metrics-preview h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        
        .metric-preview-item {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
        }
        
        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: #e6f7ff;
          color: #1890ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }
        
        .metric-name {
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        
        .metric-value {
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .trend {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
          margin-left: 0.5rem;
        }
        
        .trend.positive {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        .trend.negative {
          background-color: #fff1f0;
          color: #ff4d4f;
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
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background-color: #1890ff;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #40a9ff;
        }
        
        .btn-secondary {
          background-color: #f0f0f0;
          color: #666;
        }
        
        .btn-secondary:hover {
          background-color: #e0e0e0;
        }
        
        .btn-danger {
          background-color: #ff4d4f;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #ff7875;
        }
        
        .dark-mode {
          background-color: #1f1f1f;
          color: #f0f0f0;
        }
        
        .dark-mode .settings-card {
          background-color: #2f2f2f;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .dark-mode .setting-item {
          border-bottom-color: #3f3f3f;
        }
        
        .dark-mode .setting-description {
          color: #aaa;
        }
        
        .dark-mode .metric-preview-item {
          background-color: #2a2a2a;
        }
        
        .dark-mode .metric-name {
          color: #aaa;
        }
        
        .dark-mode .btn-secondary {
          background-color: #3f3f3f;
          color: #f0f0f0;
        }
        
        .dark-mode .btn-secondary:hover {
          background-color: #4f4f4f;
        }
        
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
          
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .setting-control {
            margin-top: 0.5rem;
            width: 100%;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSettings;
