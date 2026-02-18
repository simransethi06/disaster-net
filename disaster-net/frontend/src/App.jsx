import React, { useState, useEffect } from 'react';
import { AlertProvider } from './context/AlertContext';
import { onAuthChange, signInUser } from './services/firebase';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import SOSPanel from './components/SOSPanel';
import AlertsPanel from './components/AlertsPanel';
import MapView from './components/MapView';
import SafeRoute from './components/SafeRoute';
import AIStatus from './components/AIStatus';

function App() {
  const [user, setUser] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase Authentication
    try {
      const unsubscribe = onAuthChange((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setLoading(false);
        } else {
          // Sign in anonymously if no user
          signInUser()
            .then((newUser) => {
              setUser(newUser);
              setLoading(false);
            })
            .catch((error) => {
              console.error('Auth error:', error);
              // Continue without auth for demo
              setUser({ uid: 'demo-user' });
              setLoading(false);
            });
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase init error:', error);
      // Continue without Firebase for demo
      setUser({ uid: 'demo-user' });
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="app" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '60px', 
            height: '60px', 
            borderWidth: '4px',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            DisasterNet
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Initializing emergency response system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AlertProvider>
      <div className="app">
        <Header />
        
        <main className="main-content">
          {/* Left Panel - SOS and Emergency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SOSPanel />
            <AIStatus />
          </div>

          {/* Center Panel - Map */}
          <MapView selectedAlert={selectedAlert} />

          {/* Right Panel - Alerts and Routes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ModeSelector />
            <AlertsPanel onAlertClick={setSelectedAlert} />
            <SafeRoute />
          </div>
        </main>
      </div>
    </AlertProvider>
  );
}

export default App;