import { useState, useEffect, useCallback } from 'react';

// Custom hook for geolocation
const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    accuracy: null,
    timestamp: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default options
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  // Success handler
  const onSuccess = useCallback((position) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    });
    setError(null);
    setLoading(false);
  }, []);

  // Error handler
  const onError = useCallback((err) => {
    let errorMessage = 'Unknown error';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = err.message;
    }
    
    setError(errorMessage);
    setLoading(false);
    console.error('Geolocation error:', errorMessage);
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      defaultOptions
    );
  }, [onSuccess, onError, defaultOptions]);

  // Watch position (continuous tracking)
  const [watchId, setWatchId] = useState(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      defaultOptions
    );
    setWatchId(id);
  }, [onSuccess, onError, defaultOptions]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Auto-start on mount
  useEffect(() => {
    getCurrentPosition();
    
    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    startWatching,
    stopWatching,
    isWatching: watchId !== null
  };
};

export default useGeolocation;