import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [dataRetention, setDataRetention] = useState<string>("30");

  const handleSaveSettings = () => {
    // In a real app, this would save to Firestore or similar
    addToast({
      type: "success",
      title: "Settings Saved",
      message: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-description">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="settings-grid">
        {/* Account Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">Account</h2>
          <div className="settings-card-content">
            <div className="account-info">
              <div className="account-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.displayName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "?"}
                  </div>
                )}
              </div>
              <div className="account-details">
                <div className="account-name">
                  {user?.displayName || "User"}
                </div>
                <div className="account-email">{user?.email || "No email"}</div>
              </div>
            </div>
            <div className="account-actions">
              <button className="settings-button secondary">
                Edit Profile
              </button>
              <button className="settings-button secondary">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">Notifications</h2>
          <div className="settings-card-content">
            <div className="settings-option">
              <div className="option-label">
                <span>Enable Notifications</span>
                <span className="option-description">
                  Receive alerts for important updates
                </span>
              </div>
              <div className="option-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() =>
                      setNotificationsEnabled(!notificationsEnabled)
                    }
                    aria-label="Enable Notifications"
                  />
                  <span className="toggle-slider"></span>
                  Enable Notifications
                </label>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-label">
                <span>Email Notifications</span>
                <span className="option-description">
                  Receive notifications via email
                </span>
              </div>
              <div className="option-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    disabled={!notificationsEnabled}
                    aria-label="Email Notifications"
                  />
                  <span className="toggle-slider"></span>
                  Email Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">Appearance</h2>
          <div className="settings-card-content">
            <div className="settings-option">
              <div className="option-label">
                <span>Dark Mode</span>
                <span className="option-description">
                  Use dark theme for the application
                </span>
              </div>
              <div className="option-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    aria-label="Dark Mode"
                  />
                  <span className="toggle-slider"></span>
                  Dark Mode
                </label>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-label">
                <span>Language</span>
                <span className="option-description">
                  Select your preferred language
                </span>
              </div>
              <div className="option-control">
                <label>
                  Language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="settings-select"
                    title="Language"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">Data & Privacy</h2>
          <div className="settings-card-content">
            <div className="settings-option">
              <div className="option-label">
                <span>Data Retention</span>
                <span className="option-description">
                  How long to keep your activity data
                </span>
              </div>
              <div className="option-control">
                <label>
                  Data Retention
                  <select
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    className="settings-select"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="forever">Forever</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-label">
                <span>Download Your Data</span>
                <span className="option-description">
                  Get a copy of your personal data
                </span>
              </div>
              <div className="option-control">
                <button className="settings-button secondary">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="settings-button primary"
          onClick={handleSaveSettings}
        >
          Save Changes
        </button>
        <button className="settings-button secondary">Cancel</button>
      </div>
    </div>
  );
};

export default Settings;
