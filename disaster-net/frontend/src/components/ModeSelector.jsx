import React from 'react';
import { Users, Radio, ShieldCheck } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

const ModeSelector = () => {
  const { activeMode, setActiveMode } = useAlerts();

  const modes = [
    {
      id: 'civilian',
      label: 'Civilian',
      icon: Users,
      description: 'General public safety view'
    },
    {
      id: 'responder',
      label: 'Responder',
      icon: Radio,
      description: 'Emergency responder tools'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: ShieldCheck,
      description: 'Administrative controls'
    }
  ];

  return (
    <div className="mode-selector">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
            title={mode.description}
          >
            <Icon size={16} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;