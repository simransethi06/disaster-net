import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { alertAPI } from '../services/api';
import { getAlerts, createAlert } from '../services/firebase';
import mlService from '../services/mlService';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('civilian'); // civilian, responder, admin

  // Fetch alerts from both API and Firebase
  const fetchAlerts = useCallback(async (location = null) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from both sources
      const [apiAlerts, firebaseAlerts] = await Promise.all([
        alertAPI.getAll().catch(() => []),
        getAlerts(location).catch(() => [])
      ]);

      // Combine and deduplicate alerts
      const allAlerts = [...apiAlerts, ...firebaseAlerts];
      const uniqueAlerts = Array.from(
        new Map(allAlerts.map(alert => [alert.id, alert])).values()
      );

      // Process alerts with ML
      const processedAlerts = uniqueAlerts.map(alert => ({
        ...alert,
        urgency: alert.urgency || mlService.classifyUrgency(alert.description || '').urgency,
        timestamp: alert.timestamp || alert.createdAt?.toDate?.() || new Date()
      }));

      // Sort by urgency and timestamp
      processedAlerts.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        const urgencyDiff = (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        if (urgencyDiff !== 0) return urgencyDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setAlerts(processedAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new alert
  const addAlert = useCallback(async (alertData) => {
    try {
      // Classify urgency using ML
      const classification = mlService.classifyUrgency(alertData.description);
      
      const newAlert = {
        ...alertData,
        urgency: classification.urgency,
        confidence: classification.confidence,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      // Save to both API and Firebase
      await Promise.all([
        alertAPI.create(newAlert).catch(err => console.error('API error:', err)),
        createAlert(newAlert).catch(err => console.error('Firebase error:', err))
      ]);

      // Update local state
      setAlerts(prev => [newAlert, ...prev]);
      
      return newAlert;
    } catch (err) {
      console.error('Error adding alert:', err);
      throw err;
    }
  }, []);

  // Update alert
  const updateAlert = useCallback(async (id, updates) => {
    try {
      await alertAPI.update(id, updates);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === id ? { ...alert, ...updates } : alert
        )
      );
    } catch (err) {
      console.error('Error updating alert:', err);
      throw err;
    }
  }, []);

  // Delete alert
  const deleteAlert = useCallback(async (id) => {
    try {
      await alertAPI.delete(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
      throw err;
    }
  }, []);

  // Filter alerts by urgency
  const getAlertsByUrgency = useCallback((urgency) => {
    return alerts.filter(alert => alert.urgency === urgency);
  }, [alerts]);

  // Get nearby alerts
  const getNearbyAlerts = useCallback((location, radius = 10) => {
    if (!location || !location.lat || !location.lng) return alerts;

    return alerts.filter(alert => {
      if (!alert.location) return false;
      const distance = calculateDistance(
        location.lat,
        location.lng,
        alert.location.lat,
        alert.location.lng
      );
      return distance <= radius;
    });
  }, [alerts]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
    
    // Add some demo alerts for visualization
    const demoAlerts = [
      {
        id: 'demo-1',
        type: 'fire',
        description: 'Building fire reported in commercial area. Multiple fire units responding.',
        urgency: 'high',
        location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
        timestamp: new Date(Date.now() - 300000),
        status: 'active'
      },
      {
        id: 'demo-2',
        type: 'flood',
        description: 'Heavy rainfall causing waterlogging in low-lying areas. Traffic severely affected.',
        urgency: 'medium',
        location: { lat: 28.6280, lng: 77.2177, address: 'Kashmere Gate, Delhi' },
        timestamp: new Date(Date.now() - 600000),
        status: 'active'
      },
      {
        id: 'demo-3',
        type: 'accident',
        description: 'Traffic accident on highway. Minor injuries reported. Road partially blocked.',
        urgency: 'low',
        location: { lat: 28.6000, lng: 77.2300, address: 'Ring Road, Delhi' },
        timestamp: new Date(Date.now() - 900000),
        status: 'active'
      }
    ];
    
    // Add demo alerts if no real alerts
    setTimeout(() => {
      setAlerts(prev => prev.length === 0 ? demoAlerts : prev);
    }, 1000);
    
    // Set up polling (every 30 seconds)
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const value = {
    alerts,
    loading,
    error,
    activeMode,
    setActiveMode,
    fetchAlerts,
    addAlert,
    updateAlert,
    deleteAlert,
    getAlertsByUrgency,
    getNearbyAlerts,
    highUrgencyCount: alerts.filter(a => a.urgency === 'high').length,
    mediumUrgencyCount: alerts.filter(a => a.urgency === 'medium').length,
    lowUrgencyCount: alerts.filter(a => a.urgency === 'low').length
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;