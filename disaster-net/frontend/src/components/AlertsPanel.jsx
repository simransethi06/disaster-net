import React, { useState } from 'react';
import { AlertTriangle, MapPin, Clock, Filter, Plus, TrendingUp } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';

const AlertsPanel = ({ onAlertClick }) => {
  const { alerts, loading, addAlert, highUrgencyCount, mediumUrgencyCount, lowUrgencyCount } = useAlerts();
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [showAddAlert, setShowAddAlert] = useState(false);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.urgency === filter);

  const formatTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getAlertIcon = (type) => {
    const icons = {
      fire: '🔥',
      flood: '🌊',
      earthquake: '🌍',
      storm: '⛈️',
      medical: '🏥',
      accident: '🚗',
      security: '🚨',
      default: '⚠️'
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <AlertTriangle size={24} color="var(--warning)" />
          Active Alerts
          <span className="panel-badge">{alerts.length}</span>
        </h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowAddAlert(!showAddAlert)}
          style={{ padding: '6px 12px' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Alert Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'rgba(255, 59, 48, 0.1)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid rgba(255, 59, 48, 0.2)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--danger)' }}>
            {highUrgencyCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            High
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 149, 0, 0.1)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid rgba(255, 149, 0, 0.2)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--warning)' }}>
            {mediumUrgencyCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Medium
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 122, 255, 0.1)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid rgba(0, 122, 255, 0.2)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--info)' }}>
            {lowUrgencyCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Low
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {['all', 'high', 'medium', 'low'].map((level) => (
          <button
            key={level}
            className={`btn ${filter === level ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(level)}
            style={{ 
              padding: '6px 14px', 
              fontSize: '12px',
              textTransform: 'capitalize',
              flex: level === 'all' ? '0 0 auto' : '1'
            }}
          >
            <Filter size={12} />
            {level}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <div className="empty-text">
              {filter === 'all' 
                ? 'No active alerts in your area' 
                : `No ${filter} urgency alerts`}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`alert-card ${alert.urgency || 'low'}`}
                onClick={() => onAlertClick && onAlertClick(alert)}
              >
                <div className="alert-header">
                  <div className="alert-type">
                    {getAlertIcon(alert.type)} {alert.type || 'Alert'}
                  </div>
                  <span className={`alert-urgency ${alert.urgency || 'low'}`}>
                    {alert.urgency || 'low'}
                  </span>
                </div>
                
                <p className="alert-description">
                  {alert.description || 'No description available'}
                </p>
                
                <div className="alert-footer">
                  <div className="alert-location">
                    <MapPin size={12} />
                    <span>
                      {alert.location?.address || 
                       (alert.location?.lat && alert.location?.lng 
                         ? `${alert.location.lat.toFixed(2)}, ${alert.location.lng.toFixed(2)}`
                         : 'Unknown location')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{formatTime(alert.timestamp)}</span>
                  </div>
                </div>

                {alert.affectedCount && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingUp size={12} />
                    {alert.affectedCount} people affected
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Alert Form (Simple version) */}
      {showAddAlert && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}
        >
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
            Report New Alert
          </h4>
          <div className="input-group">
            <input
              className="input"
              placeholder="Alert type (e.g., Fire, Flood)"
              id="alert-type"
            />
          </div>
          <div className="input-group">
            <textarea
              className="input textarea"
              placeholder="Describe the situation..."
              id="alert-description"
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={async () => {
                const type = document.getElementById('alert-type').value;
                const description = document.getElementById('alert-description').value;
                
                if (!type || !description) {
                  alert('Please fill in all fields');
                  return;
                }

                try {
                  await addAlert({
                    type,
                    description,
                    location: { lat: 0, lng: 0 } // Would use actual location
                  });
                  setShowAddAlert(false);
                  document.getElementById('alert-type').value = '';
                  document.getElementById('alert-description').value = '';
                } catch (error) {
                  alert('Failed to create alert');
                }
              }}
            >
              Submit
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowAddAlert(false)}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AlertsPanel;