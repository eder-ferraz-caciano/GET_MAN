import React from 'react';

type AppMode = 'http' | 'devtools';

interface Props {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export const SidebarModeSwitch: React.FC<Props> = ({ mode, onChange }) => (
  <div className="sidebar-mode-switch">
    <button
      className={`mode-btn ${mode === 'http' ? 'active' : ''}`}
      onClick={() => onChange('http')}
    >
      HTTP Client
    </button>
    <button
      className={`mode-btn ${mode === 'devtools' ? 'active' : ''}`}
      onClick={() => onChange('devtools')}
    >
      Dev Tools
    </button>
  </div>
);
