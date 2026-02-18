// ============================================
// AI SERVICE
// ============================================
// This service handles AI/ML operations on the backend
// Integrates with ML models for predictions and classifications
// ============================================

import axios from 'axios';

class AIService {
  constructor() {
    this.mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  // Classify alert urgency using keywords and patterns
  classifyUrgency(alertText, location = null) {
    // High urgency keywords
    const highUrgencyKeywords = [
      'fire', 'explosion', 'collapse', 'trapped', 'injured',
      'flood', 'earthquake', 'tsunami', 'tornado', 'hurricane',
      'critical', 'emergency', 'danger', 'help', 'sos',
      'casualties', 'deaths', 'severe', 'major', 'disaster'
    ];
    
    // Medium urgency keywords
    const mediumUrgencyKeywords = [
      'warning', 'alert', 'caution', 'avoid', 'unsafe',
      'damaged', 'blocked', 'closed', 'evacuation', 'hazard',
      'storm', 'accident', 'medical', 'security', 'threat'
    ];

    const text = alertText.toLowerCase();
    
    // Count keyword matches
    const highMatches = highUrgencyKeywords.filter(kw => text.includes(kw)).length;
    const mediumMatches = mediumUrgencyKeywords.filter(kw => text.includes(kw)).length;
    
    // Determine urgency
    let urgency = 'low';
    let confidence = 0.6;
    let reasoning = 'Default classification';
    
    if (highMatches >= 2 || text.match(/urgent|immediate|now|asap/gi)) {
      urgency = 'high';
      confidence = 0.85 + (highMatches * 0.03);
      reasoning = `High urgency indicators: ${highMatches} critical keywords`;
    } else if (highMatches >= 1) {
      urgency = 'high';
      confidence = 0.75;
      reasoning = 'Contains critical emergency keywords';
    } else if (mediumMatches >= 2) {
      urgency = 'medium';
      confidence = 0.7;
      reasoning = `Medium urgency: ${mediumMatches} warning indicators`;
    } else if (mediumMatches >= 1) {
      urgency = 'medium';
      confidence = 0.65;
      reasoning = 'Contains warning-related keywords';
    }
    
    // Text length factor (very short alerts might be high urgency)
    if (text.length < 30 && text.match(/help|sos|emergency/gi)) {
      urgency = 'high';
      confidence = Math.max(confidence, 0.8);
      reasoning = 'Short urgent message detected';
    }
    
    return {
      urgency,
      confidence: Math.min(confidence, 0.95),
      reasoning,
      keywords: {
        high: highMatches,
        medium: mediumMatches
      }
    };
  }

  // Analyze route safety
  analyzeRouteSafety(route, alerts = [], weatherData = null) {
    let riskScore = 0;
    const riskFactors = [];

    // Check for nearby alerts along the route
    if (alerts && alerts.length > 0) {
      alerts.forEach(alert => {
        if (alert.urgency === 'high') {
          riskScore += 35;
          riskFactors.push(`High risk: ${alert.type} alert`);
        } else if (alert.urgency === 'medium') {
          riskScore += 20;
          riskFactors.push(`Moderate risk: ${alert.type} alert`);
        } else {
          riskScore += 8;
          riskFactors.push(`Low risk: ${alert.type} alert`);
        }
      });
    }

    // Weather impact
    if (weatherData) {
      if (weatherData.condition === 'severe') {
        riskScore += 30;
        riskFactors.push('Severe weather conditions');
      } else if (weatherData.condition === 'poor') {
        riskScore += 15;
        riskFactors.push('Poor weather conditions');
      }
      
      if (weatherData.visibility && weatherData.visibility < 1000) {
        riskScore += 15;
        riskFactors.push('Low visibility');
      }
    }

    // Route characteristics
    if (route.distance > 50000) { // > 50km
      riskScore += 8;
      riskFactors.push('Long distance route');
    }
    
    if (route.duration > 3600) { // > 1 hour
      riskScore += 5;
      riskFactors.push('Extended travel time');
    }

    // Determine risk level
    let riskLevel;
    if (riskScore >= 60) {
      riskLevel = 'danger';
    } else if (riskScore >= 30) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'safe';
    }

    return {
      score: Math.min(riskScore, 100),
      level: riskLevel,
      factors: riskFactors,
      recommendation: this.getRouteRecommendation(riskLevel, riskScore)
    };
  }

  // Get route recommendation
  getRouteRecommendation(riskLevel, score) {
    if (riskLevel === 'danger') {
      return 'AVOID THIS ROUTE. Seek alternative paths immediately or delay travel until conditions improve.';
    } else if (riskLevel === 'moderate') {
      if (score > 40) {
        return 'Exercise extreme caution. Consider alternative routes. If you must proceed, stay alert and be prepared to turn back.';
      }
      return 'Proceed with caution. Monitor conditions closely and follow all safety guidelines.';
    } else {
      return 'Route appears safe. Maintain normal safety precautions and stay aware of your surroundings.';
    }
  }

  // Predict disaster patterns
  async predictDisasterPattern(location, historicalAlerts = []) {
    try {
      // Calculate recent activity
      const recentAlerts = historicalAlerts.filter(alert => {
        const alertDate = new Date(alert.createdAt);
        const daysSince = (Date.now() - alertDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30; // Last 30 days
      });

      // Group by type
      const alertsByType = recentAlerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {});

      // Calculate likelihood
      const totalRecent = recentAlerts.length;
      const likelihood = Math.min((totalRecent / 20) * 100, 100);
      
      let level = 'low';
      if (likelihood > 70) level = 'high';
      else if (likelihood > 40) level = 'medium';

      return {
        likelihood,
        level,
        recentEvents: totalRecent,
        eventsByType: alertsByType,
        trend: totalRecent > 10 ? 'increasing' : totalRecent > 5 ? 'stable' : 'decreasing',
        recommendation: this.getPreparednessRecommendation(level)
      };
    } catch (error) {
      console.error('Error predicting disaster pattern:', error);
      return {
        likelihood: 0,
        level: 'unknown',
        error: error.message
      };
    }
  }

  // Get preparedness recommendation
  getPreparednessRecommendation(level) {
    const recommendations = {
      high: 'HIGH ALERT: Prepare emergency supplies, review evacuation plans, and stay informed through official channels.',
      medium: 'MODERATE ALERT: Review safety procedures, ensure emergency contacts are updated, and monitor local alerts.',
      low: 'LOW ALERT: Maintain basic emergency preparedness and stay aware of potential risks.'
    };
    
    return recommendations[level] || recommendations.low;
  }

  // Generate safety recommendations
  generateRecommendations(currentLocation, nearbyAlerts = []) {
    const recommendations = [];

    // Check for high urgency alerts nearby
    const highUrgencyNearby = nearbyAlerts.filter(a => a.urgency === 'high');
    if (highUrgencyNearby.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Evacuate or avoid the following areas immediately',
        details: highUrgencyNearby.map(a => `${a.type} at ${a.location.address || 'nearby location'}`),
        icon: '🚨'
      });
    }

    // Check for medium urgency alerts
    const mediumUrgencyNearby = nearbyAlerts.filter(a => a.urgency === 'medium');
    if (mediumUrgencyNearby.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Exercise caution in the following areas',
        details: mediumUrgencyNearby.map(a => `${a.type} alert - ${a.description?.slice(0, 100)}`),
        icon: '⚠️'
      });
    }

    // General safety
    if (nearbyAlerts.length > 5) {
      recommendations.push({
        priority: 'medium',
        action: 'High alert activity in your area',
        details: ['Consider staying indoors if possible', 'Keep emergency contacts ready', 'Monitor local news'],
        icon: '📢'
      });
    }

    // Default if no alerts
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'No immediate threats detected',
        details: ['Maintain normal safety precautions', 'Stay informed about weather conditions'],
        icon: '✅'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;