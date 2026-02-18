import React, { useState } from 'react';
import { Route, Navigation, Clock, MapPin, AlertCircle, TrendingUp } from 'lucide-react';
import { routeAPI } from '../services/api';
import mlService from '../services/mlService';
import useGeolocation from '../hooks/useGeolocation';

const SafeRoute = () => {
  const { location } = useGeolocation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleFindRoutes = async () => {
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    setLoading(true);
    
    try {
      // Use current location as origin if not specified
      const originPoint = origin || (location.lat && location.lng 
        ? `${location.lat},${location.lng}` 
        : null);

      if (!originPoint) {
        alert('Unable to determine origin location');
        setLoading(false);
        return;
      }

      // Fetch safe routes from API
      const safeRoutes = await routeAPI.getSafeRoutes(originPoint, destination);
      
      // Analyze each route with ML
      const analyzedRoutes = safeRoutes.map(route => {
        const risk = mlService.calculateRouteRisk(route, []);
        return { ...route, risk };
      });

      setRoutes(analyzedRoutes);
      if (analyzedRoutes.length > 0) {
        setSelectedRoute(analyzedRoutes[0]);
      }
    } catch (error) {
      console.error('Error finding routes:', error);
      // Generate mock routes for demo
      generateMockRoutes();
    } finally {
      setLoading(false);
    }
  };

  const generateMockRoutes = () => {
    const mockRoutes = [
      {
        id: 1,
        name: 'Route via Main Road',
        distance: 12.5,
        duration: 25,
        risk: mlService.calculateRouteRisk({ distance: 12500 }, [], null)
      },
      {
        id: 2,
        name: 'Route via Highway',
        distance: 15.2,
        duration: 18,
        risk: mlService.calculateRouteRisk({ distance: 15200 }, [
          { urgency: 'medium', type: 'Traffic' }
        ], null)
      },
      {
        id: 3,
        name: 'Route via Inner City',
        distance: 10.8,
        duration: 30,
        risk: mlService.calculateRouteRisk({ distance: 10800 }, [], null)
      }
    ];
    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
  };

  const handleUseCurrentLocation = () => {
    if (location.lat && location.lng) {
      setOrigin(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Route size={24} color="var(--info)" />
          Safe Routes
        </h2>
      </div>

      {/* Route Input Form */}
      <div style={{ marginBottom: '20px' }}>
        <div className="input-group">
          <label className="input-label">From</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input"
              placeholder="Enter origin or use current location"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleUseCurrentLocation}
              title="Use current location"
              style={{ padding: '12px' }}
            >
              <MapPin size={18} />
            </button>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">To</label>
          <input
            className="input"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFindRoutes()}
          />
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleFindRoutes}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Finding Routes...
            </>
          ) : (
            <>
              <Navigation size={18} />
              Find Safe Routes
            </>
          )}
        </button>
      </div>

      {/* Routes List */}
      {routes.length > 0 && (
        <div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px',
            color: 'var(--text-secondary)'
          }}>
            Available Routes ({routes.length})
          </h3>
          
          {routes.map((route) => (
            <div
              key={route.id}
              className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
              onClick={() => setSelectedRoute(route)}
              style={{
                cursor: 'pointer',
                border: selectedRoute?.id === route.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                transition: 'var(--transition)'
              }}
            >
              <div className="route-header">
                <div className="route-name">{route.name}</div>
                <span className={`risk-badge ${route.risk?.level || 'safe'}`}>
                  {route.risk?.level || 'Safe'}
                </span>
              </div>

              <div className="route-details">
                <div className="route-detail">
                  <Navigation size={14} />
                  <span>{route.distance} km</span>
                </div>
                <div className="route-detail">
                  <Clock size={14} />
                  <span>{route.duration} min</span>
                </div>
                <div className="route-detail">
                  <TrendingUp size={14} />
                  <span>Risk: {route.risk?.score || 0}%</span>
                </div>
              </div>

              {route.risk?.factors && route.risk.factors.length > 0 && (
                <div className="route-warnings">
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    Risk Factors:
                  </strong>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {route.risk.factors.map((factor, idx) => (
                      <li key={idx} style={{ fontSize: '12px', marginBottom: '2px' }}>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {route.risk?.recommendation && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 10px',
                  background: route.risk.level === 'danger' 
                    ? 'rgba(255, 59, 48, 0.1)' 
                    : 'rgba(52, 199, 89, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: route.risk.level === 'danger' ? 'var(--danger)' : 'var(--success)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{route.risk.recommendation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && routes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <div className="empty-text">
            Enter destination to find safe routes
          </div>
        </div>
      )}

      {/* Route Tips */}
      <div className="emergency-info" style={{ marginTop: '16px', borderLeftColor: 'var(--info)' }}>
        <h4>Route Safety Tips</h4>
        <ul style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)', 
          paddingLeft: '16px',
          margin: '8px 0 0 0'
        }}>
          <li>Always choose routes with lower risk scores</li>
          <li>Avoid areas with active high-urgency alerts</li>
          <li>Check weather conditions before traveling</li>
          <li>Share your route with family or friends</li>
          <li>Keep emergency contacts readily available</li>
        </ul>
      </div>
    </div>
  );
};

export default SafeRoute;