import Alert from '../models/Alert.js';

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
export const getAllAlerts = async (req, res) => {
  try {
    const { status, urgency, type, limit = 100 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (type) query.type = type;
    
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error in getAllAlerts:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get nearby alerts
// @route   GET /api/alerts/nearby
// @access  Public
export const getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const alerts = await Alert.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error in getNearbyAlerts:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
export const getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error in getAlert:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Public
export const createAlert = async (req, res) => {
  try {
    const { type, description, location, urgency, reportedBy } = req.body;
    
    // Validate required fields
    if (!description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Description and location are required'
      });
    }
    
    // Prepare location data
    const locationData = {
      type: 'Point',
      coordinates: [location.lng || location.longitude, location.lat || location.latitude],
      lat: location.lat || location.latitude,
      lng: location.lng || location.longitude,
      address: location.address
    };
    
    // Create alert
    const alert = await Alert.create({
      type: type || 'other',
      description,
      location: locationData,
      urgency: urgency || 'medium',
      reportedBy: reportedBy || { userType: 'anonymous' },
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error in createAlert:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Public (should be protected in production)
export const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error in updateAlert:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Public (should be protected in production)
export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteAlert:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get alerts by urgency
// @route   GET /api/alerts/urgency/:level
// @access  Public
export const getAlertsByUrgency = async (req, res) => {
  try {
    const { level } = req.params;
    
    if (!['low', 'medium', 'high'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid urgency level'
      });
    }
    
    const alerts = await Alert.findByUrgency(level);
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error in getAlertsByUrgency:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Public
export const getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Alert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        byUrgency: stats,
        byType: typeStats,
        total: await Alert.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error in getAlertStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};