// ============================================
// API SERVICE
// ============================================
// This handles all communication with the backend
// Make sure your backend is running on the URL specified in .env
// ============================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token if needed)
api.interceptors.request.use(
  (config) => {
    // Add auth token to headers if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error: No response received');
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Alert APIs
export const alertAPI = {
  // Get all alerts
  getAll: async () => {
    try {
      const response = await api.get('/api/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  // Get alerts by location
  getByLocation: async (lat, lng, radius = 50) => {
    try {
      const response = await api.get('/api/alerts/nearby', {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby alerts:', error);
      return [];
    }
  },

  // Create new alert
  create: async (alertData) => {
    try {
      const response = await api.post('/api/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Update alert
  update: async (id, updates) => {
    try {
      const response = await api.put(`/api/alerts/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  // Delete alert
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
};

// Route APIs
export const routeAPI = {
  // Get safe routes between two points
  getSafeRoutes: async (origin, destination, avoidAreas = []) => {
    try {
      const response = await api.post('/api/routes/safe', {
        origin,
        destination,
        avoidAreas
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching safe routes:', error);
      return [];
    }
  },

  // Analyze route risk
  analyzeRisk: async (routePoints) => {
    try {
      const response = await api.post('/api/routes/analyze', {
        points: routePoints
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing route risk:', error);
      return { risk: 'unknown', score: 0 };
    }
  }
};

// Emergency APIs
export const emergencyAPI = {
  // Send SOS alert
  sendSOS: async (location, userInfo, emergencyType = 'general') => {
    try {
      const response = await api.post('/api/emergency/sos', {
        location,
        userInfo,
        type: emergencyType,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SOS:', error);
      throw error;
    }
  },

  // Get emergency contacts
  getContacts: async (location) => {
    try {
      const response = await api.get('/api/emergency/contacts', {
        params: { lat: location.lat, lng: location.lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return {
        police: '100',
        fire: '101',
        ambulance: '102',
        disaster: '108'
      };
    }
  }
};

// AI Service APIs
export const aiAPI = {
  // Classify alert urgency
  classifyUrgency: async (alertText, location) => {
    try {
      const response = await api.post('/api/ai/classify-urgency', {
        text: alertText,
        location
      });
      return response.data;
    } catch (error) {
      console.error('Error classifying urgency:', error);
      return { urgency: 'medium', confidence: 0.5 };
    }
  },

  // Get AI recommendations
  getRecommendations: async (currentLocation, alerts) => {
    try {
      const response = await api.post('/api/ai/recommendations', {
        location: currentLocation,
        alerts
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  // Predict disaster patterns
  predictPatterns: async (historicalData, location) => {
    try {
      const response = await api.post('/api/ai/predict', {
        data: historicalData,
        location
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting patterns:', error);
      return null;
    }
  }
};

// Weather API (optional - can integrate external weather service)
export const weatherAPI = {
  getCurrent: async (lat, lng) => {
    try {
      const response = await api.get('/api/weather/current', {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }
};

export default api;