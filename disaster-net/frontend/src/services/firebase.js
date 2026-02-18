// ============================================
// FIREBASE CONFIGURATION
// ============================================
// ⚠️ SETUP REQUIRED:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing
// 3. Enable Authentication > Sign-in method > Email/Password
// 4. Enable Firestore Database
// 5. Copy config from Project Settings to .env file
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Initialize messaging (optional, for push notifications)
  if ('Notification' in window && 'serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.log('Messaging not available:', error);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.log('Running in demo mode without Firebase');
  // Create mock objects for demo mode
  auth = null;
  db = null;
  messaging = null;
}

// Authentication helpers
export const signInUser = async () => {
  try {
    if (!auth) {
      // Demo mode - return mock user
      return { uid: 'demo-user-' + Date.now() };
    }
    const result = await signInAnonymously(auth);
    console.log('User signed in:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('Sign in error:', error);
    // Return demo user on error
    return { uid: 'demo-user-' + Date.now() };
  }
};

export const onAuthChange = (callback) => {
  if (!auth) {
    // Demo mode - call callback with mock user
    setTimeout(() => callback({ uid: 'demo-user' }), 0);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

// Firestore helpers
export const createAlert = async (alertData) => {
  try {
    if (!db) {
      console.log('Demo mode - alert created locally');
      return 'demo-alert-' + Date.now();
    }
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alertData,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    console.log('Alert created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating alert:', error);
    return 'demo-alert-' + Date.now();
  }
};

export const getAlerts = async (location = null, radius = 50) => {
  try {
    if (!db) {
      console.log('Demo mode - returning mock alerts');
      return [];
    }
    const alertsRef = collection(db, 'alerts');
    let q = query(alertsRef, where('status', '==', 'active'));
    
    const querySnapshot = await getDocs(q);
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

// Push notification helpers
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console > Project Settings > Cloud Messaging
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
};

export const onMessageListener = () => {
  if (!messaging) return Promise.resolve();
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export { auth, db, messaging };