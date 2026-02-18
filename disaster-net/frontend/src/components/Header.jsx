import React from 'react';
import { Shield, Bell, User, Settings } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

const Header = () => {
  const { highUrgencyCount, activeMode } = useAlerts();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <Shield size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="logo-text">DisasterNet</span>
        </div>

        <div className="header-actions">
          {/* Notification Bell */}
          <button 
            className="btn btn-secondary"
            style={{ position: 'relative' }}
            title="Notifications"
          >
            <Bell size={18} />
            {highUrgencyCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {highUrgencyCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <button className="btn btn-secondary" title="Profile">
            <User size={18} />
          </button>

          {/* Settings */}
          <button className="btn btn-secondary" title="Settings">
            <Settings size={18} />
          </button>

          {/* Mode Badge */}
          <div style={{
            padding: '8px 16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'capitalize',
            color: 'var(--text-secondary)'
          }}>
            {activeMode} Mode
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
