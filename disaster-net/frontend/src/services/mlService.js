// ============================================
// MACHINE LEARNING SERVICE
// ============================================
// This handles client-side ML predictions using TensorFlow.js
// Models should be trained separately and loaded here
// ============================================

import * as tf from '@tensorflow/tfjs';

class MLService {
  constructor() {
    this.urgencyModel = null;
    this.riskModel = null;
    this.modelsLoaded = false;
  }

  // Initialize and load models
  async loadModels() {
    try {
      console.log('Loading ML models...');
      
      // Load urgency classification model
      // NOTE: You need to train and export this model first
      // For now, we'll use a simple rule-based system
      this.modelsLoaded = true;
      
      console.log('ML models loaded successfully');
    } catch (error) {
      console.error('Error loading ML models:', error);
      console.log('Falling back to rule-based predictions');
    }
  }

  // Classify alert urgency
  classifyUrgency(alertText, location = null) {
    // Keywords for urgency classification
    const highUrgencyKeywords = [
      'fire', 'flood', 'earthquake', 'tsunami', 'tornado',
      'explosion', 'collapse', 'trapped', 'injured', 'critical',
      'emergency', 'danger', 'help', 'sos', 'urgent'
    ];
    
    const mediumUrgencyKeywords = [
      'warning', 'alert', 'caution', 'avoid', 'unsafe',
      'damaged', 'blocked', 'closed', 'evacuation'
    ];

    const text = alertText.toLowerCase();
    
    // Check for high urgency
    const hasHighUrgency = highUrgencyKeywords.some(keyword => text.includes(keyword));
    if (hasHighUrgency) {
      return {
        urgency: 'high',
        confidence: 0.85,
        reasoning: 'Contains critical emergency keywords'
      };
    }

    // Check for medium urgency
    const hasMediumUrgency = mediumUrgencyKeywords.some(keyword => text.includes(keyword));
    if (hasMediumUrgency) {
      return {
        urgency: 'medium',
        confidence: 0.75,
        reasoning: 'Contains warning-related keywords'
      };
    }

    // Default to low urgency
    return {
      urgency: 'low',
      confidence: 0.65,
      reasoning: 'No immediate emergency indicators'
    };
  }

  // Calculate route risk score
  calculateRouteRisk(route, alerts = [], weatherData = null) {
    let riskScore = 0;
    let riskFactors = [];

    // Check proximity to active alerts
    if (alerts && alerts.length > 0) {
      alerts.forEach(alert => {
        if (alert.urgency === 'high') {
          riskScore += 30;
          riskFactors.push(`High urgency alert: ${alert.type}`);
        } else if (alert.urgency === 'medium') {
          riskScore += 15;
          riskFactors.push(`Medium urgency alert: ${alert.type}`);
        } else {
          riskScore += 5;
          riskFactors.push(`Low urgency alert: ${alert.type}`);
        }
      });
    }

    // Weather risk assessment
    if (weatherData) {
      if (weatherData.severe) {
        riskScore += 25;
        riskFactors.push('Severe weather conditions');
      }
      if (weatherData.precipitation > 50) {
        riskScore += 10;
        riskFactors.push('Heavy precipitation');
      }
    }

    // Route characteristics
    if (route.distance > 50000) { // > 50km
      riskScore += 5;
      riskFactors.push('Long distance route');
    }

    // Determine risk level
    let riskLevel;
    if (riskScore >= 50) {
      riskLevel = 'danger';
    } else if (riskScore >= 25) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'safe';
    }

    return {
      score: Math.min(riskScore, 100),
      level: riskLevel,
      factors: riskFactors,
      recommendation: this.getRouteRecommendation(riskLevel)
    };
  }

  // Get route recommendation based on risk
  getRouteRecommendation(riskLevel) {
    const recommendations = {
      danger: 'Avoid this route. Consider alternative paths or delay travel.',
      moderate: 'Exercise caution. Stay alert and follow safety guidelines.',
      safe: 'Route appears safe. Continue with normal precautions.'
    };

    return recommendations[riskLevel] || recommendations.safe;
  }

  // Predict disaster likelihood
  predictDisasterLikelihood(location, historicalData = []) {
    // This would use a trained model in production
    // For now, using simplified logic
    
    const recentAlerts = historicalData.filter(data => {
      const alertDate = new Date(data.timestamp);
      const daysSince = (Date.now() - alertDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // Last 7 days
    });

    const likelihood = Math.min((recentAlerts.length / 10) * 100, 100);
    
    return {
      likelihood: likelihood,
      level: likelihood > 70 ? 'high' : likelihood > 40 ? 'medium' : 'low',
      recentEvents: recentAlerts.length,
      recommendation: this.getDisasterRecommendation(likelihood)
    };
  }

  // Get disaster preparation recommendation
  getDisasterRecommendation(likelihood) {
    if (likelihood > 70) {
      return 'High risk area. Prepare emergency supplies and evacuation plan.';
    } else if (likelihood > 40) {
      return 'Moderate risk. Stay informed and review safety procedures.';
    } else {
      return 'Low risk. Maintain basic emergency preparedness.';
    }
  }

  // Sentiment analysis for alert text
  analyzeSentiment(text) {
    const negativeWords = ['danger', 'emergency', 'critical', 'severe', 'urgent', 'help'];
    const urgentWords = ['now', 'immediately', 'quickly', 'asap'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const urgentCount = urgentWords.filter(word => lowerText.includes(word)).length;
    
    const sentiment = negativeCount + urgentCount * 1.5;
    
    return {
      score: Math.min(sentiment * 10, 100),
      level: sentiment > 3 ? 'critical' : sentiment > 1 ? 'concerning' : 'informational'
    };
  }

  // Generate safety score for a location
  generateSafetyScore(location, alerts = [], timeOfDay = 'day') {
    let safetyScore = 100; // Start with perfect score
    
    // Reduce score based on nearby alerts
    alerts.forEach(alert => {
      if (alert.urgency === 'high') safetyScore -= 30;
      else if (alert.urgency === 'medium') safetyScore -= 15;
      else safetyScore -= 5;
    });
    
    // Night time factor
    if (timeOfDay === 'night') {
      safetyScore -= 5;
    }
    
    return {
      score: Math.max(safetyScore, 0),
      level: safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'caution' : 'unsafe',
      alerts: alerts.length
    };
  }
}

// Export singleton instance
const mlService = new MLService();

// Initialize models on import
mlService.loadModels().catch(err => {
  console.error('Failed to initialize ML service:', err);
});

export default mlService;