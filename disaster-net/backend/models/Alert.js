import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['fire', 'flood', 'earthquake', 'storm', 'medical', 'accident', 'security', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    },
    address: {
      type: String,
      trim: true
    },
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'investigating', 'archived'],
    default: 'active'
  },
  reportedBy: {
    userId: String,
    userType: {
      type: String,
      enum: ['civilian', 'responder', 'admin', 'anonymous'],
      default: 'anonymous'
    }
  },
  affectedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  aiClassification: {
    urgency: String,
    confidence: Number,
    reasoning: String,
    timestamp: Date
  },
  metadata: {
    weatherConditions: String,
    timeOfDay: String,
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'false_alarm'],
      default: 'unverified'
    },
    verifiedBy: String,
    verifiedAt: Date
  },
  attachments: [{
    type: String, // URLs to images/videos
    url: String
  }],
  updates: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create geospatial index for location-based queries
alertSchema.index({ 'location.coordinates': '2dsphere' });

// Index for faster queries
alertSchema.index({ status: 1, urgency: -1, createdAt: -1 });
alertSchema.index({ type: 1, createdAt: -1 });

// Virtual for getting lat/lng in readable format
alertSchema.virtual('locationCoords').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      lng: this.location.coordinates[0],
      lat: this.location.coordinates[1]
    };
  }
  return null;
});

// Method to find nearby alerts
alertSchema.statics.findNearby = function(lat, lng, radiusInKm = 50) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    status: 'active'
  });
};

// Method to get alerts by urgency
alertSchema.statics.findByUrgency = function(urgency) {
  return this.find({ urgency, status: 'active' })
    .sort({ createdAt: -1 });
};

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;