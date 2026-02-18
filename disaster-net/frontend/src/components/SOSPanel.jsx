import React, { useState } from 'react';
import { AlertCircle, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { emergencyAPI } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

const SOSPanel = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sending, setSending] = useState(false);
  const { location, error: locationError } = useGeolocation();

  const handleSOS = async () => {
    if (sending) return;

    if (!location.lat || !location.lng) {
      alert('Location unavailable. Please enable location services.');
      return;
    }

    const confirmed = window.confirm(
      'This will send an emergency SOS alert to nearby responders. Continue?'
    );

    if (!confirmed) return;

    setSending(true);
    
    try {
      await emergencyAPI.sendSOS(
        { lat: location.lat, lng: location.lng },
        { timestamp: Date.now() },
        'general'
      );
      
      setSosActive(true);
      
      // Show success notification
      alert('SOS sent successfully! Emergency responders have been notified.');
      
      // Auto-deactivate after 2 minutes (UI only - server keeps it active)
      setTimeout(() => setSosActive(false), 120000);
    } catch (error) {
      alert('Failed to send SOS. Please try calling emergency services directly.');
      console.error('SOS error:', error);
    } finally {
      setSending(false);
    }
  };

  const emergencyContacts = [
    { name: 'Police', number: '100', icon: '🚓' },
    { name: 'Fire', number: '101', icon: '🚒' },
    { name: 'Ambulance', number: '102', icon: '🚑' },
    { name: 'Disaster', number: '108', icon: '⚠️' }
  ];

  return (
    <div className="panel sos-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <AlertCircle size={24} color="var(--primary)" />
          Emergency
        </h2>
      </div>

      {/* SOS Button */}
      <button
        className={`sos-button ${sosActive ? 'active' : ''}`}
        onClick={handleSOS}
        disabled={sending}
      >
        <div className="sos-content">
          {sending ? (
            <>
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
              <span>Sending SOS...</span>
            </>
          ) : sosActive ? (
            <>
              <CheckCircle size={24} />
              <span>SOS ACTIVE</span>
            </>
          ) : (
            <>
              <AlertCircle size={24} />
              <span>SEND SOS</span>
            </>
          )}
        </div>
      </button>

      {/* Location Status */}
      <div className="emergency-info" style={{ marginTop: '16px', borderLeftColor: 'var(--info)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} />
          Current Location
        </h4>
        {location.lat && location.lng ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div>Lat: {location.lat.toFixed(6)}</div>
            <div>Lng: {location.lng.toFixed(6)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--success)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
              Accuracy: {location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}
            </div>
          </div>
        ) : locationError ? (
          <div style={{ fontSize: '13px', color: 'var(--danger)' }}>
            {locationError}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Getting location...
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-info">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={14} />
          Emergency Contacts
        </h4>
        <div className="emergency-contacts">
          {emergencyContacts.map((contact) => (
            <div key={contact.number} className="contact-item">
              <span>
                {contact.icon} {contact.name}
              </span>
              <a 
                href={`tel:${contact.number}`}
                className="contact-number"
                style={{ textDecoration: 'none' }}
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="emergency-info" style={{ borderLeftColor: 'var(--warning)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} />
          Quick Safety Tips
        </h4>
        <ul style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)', 
          paddingLeft: '20px',
          margin: '8px 0 0 0'
        }}>
          <li>Stay calm and assess the situation</li>
          <li>Move to a safe location if possible</li>
          <li>Follow official instructions</li>
          <li>Keep phone charged and accessible</li>
        </ul>
      </div>

      {sosActive && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(52, 199, 89, 0.1)',
          border: '1px solid rgba(52, 199, 89, 0.3)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          color: 'var(--success)',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ✓ Help is on the way. Stay where you are if safe.
        </div>
      )}
    </div>
  );
};

export default SOSPanel;