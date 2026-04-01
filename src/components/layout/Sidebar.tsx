import React, { useState } from 'react';
import { SidebarModeSwitch } from './SidebarModeSwitch';
import { CollectionTree } from '../http/CollectionTree';
import { DevToolsPanel } from '../devtools/DevToolsPanel';

interface SidebarProps {
  exportCollection?: any;
  importCollection?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ exportCollection, importCollection }) => {
  const [mode, setMode] = useState<'http' | 'devtools'>('http');

  return (
    <div className="sidebar">
      <SidebarModeSwitch mode={mode} onChange={setMode} />
      {mode === 'http' && <CollectionTree exportCollection={exportCollection} importCollection={importCollection} />}
      {mode === 'devtools' && <DevToolsPanel />}
    </div>
  );
};
