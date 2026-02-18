import React, { useState, useEffect } from 'react';
import { Brain, Activity, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import mlService from '../services/mlService';

const AIStatus = () => {
  const { alerts } = useAlerts();
  const [aiStats, setAiStats] = useState({
    alertsProcessed: 0,
    accuracy: 0,
    predictionsToday: 0,
    modelsActive: 2
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate AI processing
    const interval = setInterval(() => {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 800);
      
      setAiStats(prev => ({
        alertsProcessed: prev.alertsProcessed + Math.floor(Math.random() * 3),
        accuracy: Math.min(95, prev.accuracy + (Math.random() * 0.5)),
        predictionsToday: prev.predictionsToday + Math.floor(Math.random() * 2),
        modelsActive: 2
      }));
    }, 5000);

    // Initial stats
    setAiStats({
      alertsProcessed: alerts.length,
      accuracy: 87.5 + Math.random() * 5,
      predictionsToday: Math.floor(Math.random() * 50) + 20,
      modelsActive: 2
    });

    return () => clearInterval(interval);
  }, [alerts]);

  const features = [
    {
      icon: Activity,
      label: 'Real-time Analysis',
      status: 'active',
      color: 'var(--success)'
    },
    {
      icon: Zap,
      label: 'Urgency Classification',
      status: 'active',
      color: 'var(--warning)'
    },
    {
      icon: TrendingUp,
      label: 'Risk Prediction',
      status: 'active',
      color: 'var(--info)'
    }
  ];

  return (
    <div className="ai-status">
      <div className="ai-header">
        <div className={`ai-indicator ${isProcessing ? 'processing' : ''}`} 
             style={{ animation: isProcessing ? 'blink 0.8s ease-in-out' : 'none' }} />
        <h3 className="ai-title">
          <Brain size={18} />
          AI System Status
        </h3>
      </div>

      {/* AI Statistics */}
      <div className="ai-stats">
        <div className="ai-stat">
          <span className="ai-stat-value">{aiStats.alertsProcessed}</span>
          <span className="ai-stat-label">Alerts Analyzed</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value">{aiStats.accuracy.toFixed(1)}%</span>
          <span className="ai-stat-label">Accuracy</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value">{aiStats.predictionsToday}</span>
          <span className="ai-stat-label">Predictions Today</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value">{aiStats.modelsActive}</span>
          <span className="ai-stat-label">Active Models</span>
        </div>
      </div>

      {/* AI Features */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          marginBottom: '10px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Active Features
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={feature.color} />
                  <span>{feature.label}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--success)',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  <CheckCircle size={12} />
                  {feature.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Performance */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>
            Model Performance
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Last 24h
          </span>
        </div>
        
        {/* Performance Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-elevated)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${aiStats.accuracy}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--success) 0%, var(--info) 100%)',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '11px',
          color: 'var(--text-tertiary)'
        }}>
          <span>Excellent</span>
          <span>{aiStats.accuracy.toFixed(1)}%</span>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(0, 122, 255, 0.1)',
          border: '1px solid rgba(0, 122, 255, 0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--info)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div className="spinner" style={{ 
            width: '12px', 
            height: '12px', 
            borderWidth: '2px',
            borderTopColor: 'var(--info)'
          }} />
          Processing new data...
        </div>
      )}
    </div>
  );
};

export default AIStatus;