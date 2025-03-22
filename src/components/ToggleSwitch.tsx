
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, label }) => {
  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
        />
      </button>
      <span className="text-muted-foreground">
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </span>
    </div>
  );
};

export default ToggleSwitch;
