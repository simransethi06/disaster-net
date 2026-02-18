// ============================================
// MAPS SERVICE
// ============================================
// ⚠️ REQUIRED: Add GOOGLE_MAPS_API_KEY to .env file
// Get your API key from: https://console.cloud.google.com/google/maps-apis
// Enable: Maps JavaScript API, Geocoding API, Directions API
// ============================================

import axios from 'axios';

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api';
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured');
        return null;
      }

      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured');
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }

      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  // Get directions between two points
  async getDirections(origin, destination, avoidAreas = []) {
    try {
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured');
        return this.generateMockRoute(origin, destination);
      }

      const params = {
        origin,
        destination,
        key: this.apiKey,
        alternatives: true,
        mode: 'driving'
      };

      // Add avoid areas if specified
      if (avoidAreas.length > 0) {
        params.avoid = avoidAreas.join('|');
      }

      const response = await axios.get(`${this.baseURL}/directions/json`, { params });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        return response.data.routes.map((route, index) => ({
          id: index + 1,
          name: route.summary || `Route ${index + 1}`,
          distance: route.legs[0].distance.value / 1000, // Convert to km
          duration: route.legs[0].duration.value / 60, // Convert to minutes
          polyline: route.overview_polyline.points,
          steps: route.legs[0].steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.text,
            duration: step.duration.text
          }))
        }));
      }

      return [this.generateMockRoute(origin, destination)];
    } catch (error) {
      console.error('Directions error:', error.message);
      return [this.generateMockRoute(origin, destination)];
    }
  }

  // Generate mock route (fallback when API is unavailable)
  generateMockRoute(origin, destination) {
    return {
      id: 1,
      name: 'Route via Main Road',
      distance: 10 + Math.random() * 20, // 10-30 km
      duration: 15 + Math.random() * 30, // 15-45 minutes
      polyline: '',
      steps: [
        { instruction: 'Head towards destination', distance: '2 km', duration: '5 min' },
        { instruction: 'Continue straight', distance: '5 km', duration: '10 min' },
        { instruction: 'Turn right', distance: '3 km', duration: '8 min' }
      ]
    };
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Check if point is within radius of location
  isWithinRadius(point, center, radiusKm) {
    const distance = this.calculateDistance(
      point.lat, point.lng,
      center.lat, center.lng
    );
    return distance <= radiusKm;
  }

  // Get places nearby (e.g., hospitals, police stations)
  async getNearbyPlaces(lat, lng, type = 'hospital', radius = 5000) {
    try {
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured');
        return [];
      }

      const response = await axios.get(`${this.baseURL}/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          name: place.name,
          address: place.vicinity,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating,
          isOpen: place.opening_hours?.open_now
        }));
      }

      return [];
    } catch (error) {
      console.error('Nearby places error:', error.message);
      return [];
    }
  }
}

// Export singleton instance
const mapsService = new MapsService();
export default mapsService;