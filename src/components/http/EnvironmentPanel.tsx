import React from 'react';

interface EnvironmentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  editingEnvId: string | null;
  setEditingEnvId: (id: string | null) => void;
  globalVariables: any[];
  setGlobalVariables: (vars: any[]) => void;
  getWorkspaceEnvironments: (wsId: string) => any[];
  getWorkspaceActiveEnvId: (wsId: string) => string | null;
  activeNodeId: string | null;
  findParentWorkspace: (nodeId: string) => any;
  updateNodeInCollection: (wsId: string, updater: (node: any) => any) => void;
  removeEnv: (envId: string) => void;
  addEnv: () => void;
  renderVarTable: (vars: any[], onChange: (v: any[]) => void, title: string, showEnabled?: boolean) => React.ReactNode;
}

export function EnvironmentPanel(_props: EnvironmentPanelProps) {
  return <></>;
}
