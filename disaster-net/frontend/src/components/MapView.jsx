import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Navigation, ZoomIn, ZoomOut, Layers, Target } from 'lucide-react';
import L from 'leaflet';
import { useAlerts } from '../context/AlertContext';
import useGeolocation from '../hooks/useGeolocation';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different alert types
const createCustomIcon = (urgency, type) => {
  const colors = {
    high: '#FF3B30',
    medium: '#FF9500',
    low: '#007AFF'
  };
  
  const color = colors[urgency] || colors.low;
  
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.3"/>
      <circle cx="16" cy="16" r="8" fill="${color}"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to handle map controls
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapView = ({ selectedAlert }) => {
  const { alerts } = useAlerts();
  const { location } = useGeolocation();
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Delhi default
  const [mapZoom, setMapZoom] = useState(12);
  const [mapLayer, setMapLayer] = useState('streets');
  const mapRef = useRef(null);

  // Update map center when location is available
  useEffect(() => {
    if (location.lat && location.lng) {
      setMapCenter([location.lat, location.lng]);
    }
  }, [location]);

  // Focus on selected alert
  useEffect(() => {
    if (selectedAlert && selectedAlert.location) {
      setMapCenter([selectedAlert.location.lat, selectedAlert.location.lng]);
      setMapZoom(15);
    }
  }, [selectedAlert]);

  const handleLocateMe = () => {
    if (location.lat && location.lng) {
      setMapCenter([location.lat, location.lng]);
      setMapZoom(15);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const tileLayers = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  return (
    <div className="map-container">
      {/* Map Overlay - Search */}
      <div className="map-overlay">
        <input
          type="text"
          className="map-search"
          placeholder="Search location..."
        />
        <button 
          className="btn btn-secondary"
          onClick={() => setMapLayer(mapLayer === 'streets' ? 'dark' : 'streets')}
          title="Change map style"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url={tileLayers[mapLayer]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Current Location Marker */}
        {location.lat && location.lng && (
          <>
            <Marker 
              position={[location.lat, location.lng]}
              icon={L.divIcon({
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #007AFF;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  "></div>
                `,
                className: 'current-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div style={{ padding: '4px' }}>
                  <strong>Your Location</strong>
                  <br />
                  Accuracy: {location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}
                </div>
              </Popup>
            </Marker>
            
            {/* Accuracy Circle */}
            {location.accuracy && (
              <Circle
                center={[location.lat, location.lng]}
                radius={location.accuracy}
                pathOptions={{
                  color: '#007AFF',
                  fillColor: '#007AFF',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            )}
          </>
        )}

        {/* Alert Markers */}
        {alerts.map((alert, index) => {
          if (!alert.location || !alert.location.lat || !alert.location.lng) return null;
          
          return (
            <React.Fragment key={alert.id || index}>
              <Marker
                position={[alert.location.lat, alert.location.lng]}
                icon={createCustomIcon(alert.urgency, alert.type)}
              >
                <Popup>
                  <div style={{ padding: '8px', minWidth: '200px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <strong style={{ fontSize: '14px' }}>{alert.type}</strong>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: alert.urgency === 'high' ? '#FF3B30' : 
                                   alert.urgency === 'medium' ? '#FF9500' : '#007AFF',
                        color: 'white'
                      }}>
                        {alert.urgency}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', margin: '8px 0', color: '#666' }}>
                      {alert.description}
                    </p>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Danger radius for high urgency alerts */}
              {alert.urgency === 'high' && (
                <Circle
                  center={[alert.location.lat, alert.location.lng]}
                  radius={1000} // 1km radius
                  pathOptions={{
                    color: '#FF3B30',
                    fillColor: '#FF3B30',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Controls */}
      <div className="map-controls">
        <button 
          className="map-control-btn"
          onClick={handleLocateMe}
          title="Locate me"
        >
          <Target size={20} />
        </button>
        <button 
          className="map-control-btn"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          className="map-control-btn"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          className="map-control-btn"
          onClick={() => {/* Toggle 3D view */}}
          title="Navigation"
        >
          <Navigation size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapView;