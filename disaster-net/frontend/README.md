# 🚨 DisasterNet - AI-Powered Emergency Response System

A real-time disaster management platform with AI-powered alert classification, safe route planning, and emergency response coordination.

![DisasterNet](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

- **Real-time Alert System**: Monitor and report disasters in real-time
- **AI Alert Classification**: Automatic urgency classification using ML
- **Safe Route Planning**: Find the safest routes avoiding danger zones
- **SOS Emergency Button**: One-tap emergency alert to responders
- **Interactive Map**: Real-time visualization of alerts and safe zones
- **Multi-mode Interface**: Civilian, Responder, and Admin views
- **Location-based Alerts**: Get alerts relevant to your location
- **Emergency Contacts**: Quick access to emergency services

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite
- **Leaflet** for interactive maps
- **Framer Motion** for animations
- **TensorFlow.js** for client-side ML
- **Firebase** for authentication and real-time database
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Google Maps API** for geocoding and directions
- **AI/ML Services** for alert classification

### Machine Learning
- **Python** with scikit-learn
- **TF-IDF** for text vectorization
- **Random Forest** for classification

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account (free tier)
- Firebase account
- Google Cloud account (for Maps API)

## 🚀 Quick Start Guide

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd disasternet
\`\`\`

### 2. Backend Setup

#### Step 1: Install Dependencies
\`\`\`bash
cd backend
npm install
\`\`\`

#### Step 2: Configure Environment Variables
Create a `.env` file in the `backend` directory:

\`\`\`env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (REQUIRED)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Step 3: Get MongoDB Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Paste into `.env` file

#### Step 4: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Create credentials → API Key
5. Copy the API key to `.env` file

#### Step 5: Start Backend Server
\`\`\`bash
npm start
# or for development with auto-reload:
npm run dev
\`\`\`

You should see:
\`\`\`
✅ MongoDB Connected
🚀 DisasterNet Backend Server Started
📡 Server running on port 5000
\`\`\`

### 3. Frontend Setup

#### Step 1: Install Dependencies
\`\`\`bash
cd ../frontend
npm install
\`\`\`

#### Step 2: Configure Environment Variables
Create a `.env` file in the `frontend` directory:

\`\`\`env
# Backend API
VITE_API_URL=http://localhost:5000

# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key (same as backend)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
\`\`\`

#### Step 3: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Go to Project Settings → General
4. Scroll to "Your apps" → Click "Web" icon
5. Register your app
6. Copy the config values to `.env` file

#### Step 4: Enable Firebase Services
1. **Authentication**: 
   - Go to Authentication → Sign-in method
   - Enable "Anonymous" authentication
2. **Firestore Database**:
   - Go to Firestore Database
   - Create database (start in test mode for development)

#### Step 5: Start Frontend
\`\`\`bash
npm run dev
\`\`\`

The app should open at `http://localhost:3000`

### 4. ML Model Training (Optional)

#### Step 1: Install Python Dependencies
\`\`\`bash
cd ../ml-models/urgency-classifier
pip install pandas scikit-learn joblib numpy
\`\`\`

#### Step 2: Train the Model
\`\`\`bash
python train.py
\`\`\`

This will:
- Load the dataset
- Train the urgency classifier
- Save the model as `model.pkl`
- Show accuracy and test predictions

## 📁 Project Structure

\`\`\`
disasternet/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API and Firebase services
│   │   ├── context/        # React context for state
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.jsx         # Main app component
│   │   └── styles.css      # Global styles
│   ├── .env                # Frontend environment variables
│   └── package.json
│
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── config/             # Configuration
│   ├── server.js           # Main server file
│   ├── .env                # Backend environment variables
│   └── package.json
│
└── ml-models/              # Machine learning models
    └── urgency-classifier/
        ├── train.py        # Training script
        ├── dataset.csv     # Training data
        └── model.pkl       # Trained model (generated)
\`\`\`

## 🎮 Usage

### For Civilians
1. **View Active Alerts**: See all disasters in your area
2. **Report New Alert**: Click "+" to report a disaster
3. **Send SOS**: Press the SOS button in emergency
4. **Find Safe Routes**: Enter destination to get safe routes

### For Responders
1. Switch to "Responder Mode"
2. View high-priority alerts
3. Coordinate response efforts
4. Update alert status

### For Admins
1. Switch to "Admin Mode"
2. Manage all alerts
3. View analytics and statistics
4. Coordinate multiple responders

## 🔧 Configuration

### MongoDB Setup
The app uses MongoDB Atlas. Here's what you need:

1. **Create Cluster**: Free M0 cluster is sufficient
2. **Network Access**: Add your IP (or 0.0.0.0/0 for all IPs in development)
3. **Database User**: Create with read/write permissions
4. **Connection String**: Format: `mongodb+srv://username:password@cluster.mongodb.net/disasternet`

### Firebase Setup
Required services:

1. **Authentication**: Enable Anonymous auth
2. **Firestore**: For real-time alerts
3. **Storage** (optional): For image uploads
4. **Cloud Messaging** (optional): For push notifications

### Google Maps Setup
Enable these APIs in Google Cloud Console:

1. **Maps JavaScript API**: For map display
2. **Geocoding API**: For address lookup
3. **Directions API**: For route planning
4. **Places API** (optional): For nearby places

## 🐛 Troubleshooting

### Backend won't start
- **MongoDB connection error**: 
  - Check MONGODB_URI in `.env`
  - Verify IP whitelist in MongoDB Atlas
  - Ensure password is correct in connection string
  
- **Port already in use**: Change PORT in `.env`

### Frontend won't connect
- **CORS error**: Ensure FRONTEND_URL matches in backend `.env`
- **Firebase error**: Check all Firebase config in `.env`
- **Map not loading**: Verify Google Maps API key

### ML Model Issues
- **Import errors**: Install dependencies with `pip install`
- **Low accuracy**: Add more training data to `dataset.csv`

## 📊 API Endpoints

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/nearby?lat=X&lng=Y` - Get nearby alerts
- `GET /api/alerts/:id` - Get single alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### AI
- `POST /api/ai/classify-urgency` - Classify alert urgency
- `POST /api/ai/recommendations` - Get safety recommendations
- `POST /api/ai/predict` - Predict disaster patterns

### Routes
- `POST /api/routes/safe` - Get safe routes
- `POST /api/routes/analyze` - Analyze route risk

### Emergency
- `POST /api/emergency/sos` - Send SOS alert
- `GET /api/emergency/contacts` - Get emergency contacts

## 🎨 UI Features

- **Dark Mode**: Optimized for emergency viewing
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live alert notifications
- **Smooth Animations**: Professional UI transitions
- **Accessibility**: WCAG compliant

## 🔐 Security Notes

**For Production:**
1. Add authentication middleware
2. Validate all inputs
3. Use environment-specific configs
4. Enable Firebase security rules
5. Set up rate limiting
6. Use HTTPS
7. Implement proper error handling

## 📝 License

MIT License - feel free to use for your hackathon!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 🏆 Hackathon Tips

1. **Demo Flow**:
   - Start with civilian view showing active alerts
   - Demonstrate SOS button
   - Show safe route planning
   - Switch to responder mode
   - Highlight AI classification

2. **Key Selling Points**:
   - Real-time disaster response
   - AI-powered urgency classification
   - Safe route planning
   - Multi-stakeholder platform
   - Scalable architecture

3. **Technical Highlights**:
   - Full-stack implementation
   - Machine learning integration
   - Real-time capabilities
   - Production-ready code

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all `.env` variables are set
3. Ensure all services (MongoDB, Firebase) are configured
4. Check API keys are valid and have correct permissions

## ✨ Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Mobile app (React Native)
- [ ] Advanced ML models (deep learning)
- [ ] Multi-language support
- [ ] Drone integration for aerial monitoring
- [ ] IoT sensor integration
- [ ] Predictive analytics dashboard
- [ ] Voice-activated SOS
- [ ] Offline mode support

---

**Good luck with your hackathon! 🚀**

*Built with ❤️ for saving lives in disasters*
\`\`\`