import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/icons/icon-72x72.png" alt="SafeSpec Logo" />
          <span className="logo-text">SafeSpec</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className={`nav-item ${isActive('/dashboard')}`}>
            <Link to="/dashboard" className="nav-link">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          
          <li className={`nav-item ${isActive('/incidents')}`}>
            <Link to="/incidents" className="nav-link">
              <span className="nav-icon">🚨</span>
              <span className="nav-text">Incident Reports</span>
            </Link>
          </li>
          
          <li className={`nav-item ${isActive('/risk-management')}`}>
            <Link to="/risk-management" className="nav-link">
              <span className="nav-icon">⚠️</span>
              <span className="nav-text">Risk Management</span>
            </Link>
          </li>
          
          <li className={`nav-item ${isActive('/documents')}`}>
            <Link to="/documents" className="nav-link">
              <span className="nav-icon">📄</span>
              <span className="nav-text">Document Control</span>
            </Link>
          </li>
          
          <li className={`nav-item ${isActive('/training')}`}>
            <Link to="/training" className="nav-link">
              <span className="nav-icon">🎓</span>
              <span className="nav-text">Training Records</span>
            </Link>
          </li>
          
          <li className={`nav-item ${isActive('/permits')}`}>
            <Link to="/permits" className="nav-link">
              <span className="nav-icon">🔖</span>
              <span className="nav-text">Permit to Work</span>
            </Link>
          </li>
          
          {user && user.role === 'admin' && (
            <li className={`nav-item ${isActive('/users')}`}>
              <Link to="/users" className="nav-link">
                <span className="nav-icon">👥</span>
                <span className="nav-text">User Management</span>
              </Link>
            </li>
          )}
          
          <li className={`nav-item ${isActive('/ai-assistant')}`}>
            <Link to="/ai-assistant" className="nav-link">
              <span className="nav-icon">🤖</span>
              <span className="nav-text">AI Assistant</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
