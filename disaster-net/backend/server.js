// ============================================
// DISASTERNET BACKEND SERVER
// ============================================
// ⚠️ BEFORE RUNNING:
// 1. Install dependencies: npm install
// 2. Configure .env file with all required variables
// 3. Set up MongoDB Atlas and add connection string
// 4. Add Firebase and Google Maps API keys
// 5. Run: npm start (or npm run dev for development)
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import alertRoutes from './routes/alertRoutes.js';
import aiService from './services/aiService.js';
import mapsService from './services/mapsService.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/alerts', alertRoutes);

// AI/ML Routes
app.post('/api/ai/classify-urgency', async (req, res) => {
  try {
    const { text, location } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const classification = aiService.classifyUrgency(text, location);
    
    res.status(200).json({
      success: true,
      data: classification
    });
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { location, alerts } = req.body;
    
    const recommendations = aiService.generateRecommendations(location, alerts);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

app.post('/api/ai/predict', async (req, res) => {
  try {
    const { data, location } = req.body;
    
    const prediction = await aiService.predictDisasterPattern(location, data);
    
    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Route Planning Routes
app.post('/api/routes/safe', async (req, res) => {
  try {
    const { origin, destination, avoidAreas } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required'
      });
    }

    const routes = await mapsService.getDirections(origin, destination, avoidAreas);
    
    // Analyze safety for each route
    const safeRoutes = routes.map(route => {
      const risk = aiService.analyzeRouteSafety(route, [], null);
      return { ...route, risk };
    });
    
    res.status(200).json({
      success: true,
      data: safeRoutes
    });
  } catch (error) {
    console.error('Route planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

app.post('/api/routes/analyze', async (req, res) => {
  try {
    const { points, alerts } = req.body;
    
    const route = { distance: 10000, duration: 600, points };
    const analysis = aiService.analyzeRouteSafety(route, alerts || []);
    
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Route analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Emergency SOS Route
app.post('/api/emergency/sos', async (req, res) => {
  try {
    const { location, userInfo, type } = req.body;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    // In production, this would:
    // 1. Store SOS in database
    // 2. Notify nearby responders
    // 3. Send to emergency services
    // 4. Trigger real-time alerts
    
    console.log('🚨 SOS RECEIVED:', {
      location,
      type,
      timestamp: new Date().toISOString()
    });
    
    // Create high-priority alert
    // This is a simplified version - in production you'd have more sophisticated handling
    
    res.status(200).json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        sosId: `SOS-${Date.now()}`,
        status: 'active',
        estimatedResponseTime: '5-10 minutes',
        nearestResponders: 3
      }
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Get emergency contacts
app.get('/api/emergency/contacts', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // In production, this would return location-specific emergency numbers
    const contacts = {
      police: '100',
      fire: '101',
      ambulance: '102',
      disaster: '108',
      women: '1091',
      child: '1098'
    };
    
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Maps/Geocoding Routes
app.get('/api/maps/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const result = await mapsService.geocodeAddress(address);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

app.get('/api/maps/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const address = await mapsService.reverseGeocode(
      parseFloat(lat),
      parseFloat(lng)
    );
    
    res.status(200).json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DisasterNet API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DisasterNet API',
    version: '1.0.0',
    endpoints: {
      alerts: '/api/alerts',
      ai: '/api/ai',
      routes: '/api/routes',
      emergency: '/api/emergency',
      maps: '/api/maps',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 DisasterNet Backend Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log('\n📋 Available Routes:');
  console.log(`   GET  /health`);
  console.log(`   GET  /api/alerts`);
  console.log(`   POST /api/alerts`);
  console.log(`   GET  /api/alerts/nearby`);
  console.log(`   POST /api/ai/classify-urgency`);
  console.log(`   POST /api/routes/safe`);
  console.log(`   POST /api/emergency/sos`);
  console.log('\n⚠️  Make sure to configure .env file with required credentials\n');
});

export default app;