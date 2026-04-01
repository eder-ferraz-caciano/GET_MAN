import { useCallback } from 'react';
import { useRequestContext } from '../context/RequestContext';
import { useCollection } from './useCollection';
import type { Environment, CollectionNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useEnvironment = () => {
  const { collection, globalVariables } = useRequestContext();
  const { findParentWorkspace, updateNodeInCollection } = useCollection();

  const getActiveEnvironment = useCallback(
    (nodeId: string): Environment | null => {
      const ws = findParentWorkspace(nodeId);
      if (!ws?.workspaceConfig) return null;
      return ws.workspaceConfig.environments.find(e => e.id === ws.workspaceConfig!.activeEnvironmentId) || null;
    },
    [findParentWorkspace]
  );

  const getWorkspaceEnvironments = useCallback(
    (nodeId: string): Environment[] => {
      const ws = findParentWorkspace(nodeId);
      return ws?.workspaceConfig?.environments || [];
    },
    [findParentWorkspace]
  );

  const getWorkspaceActiveEnvId = useCallback(
    (nodeId: string): string | null => {
      const ws = findParentWorkspace(nodeId);
      return ws?.workspaceConfig?.activeEnvironmentId || null;
    },
    [findParentWorkspace]
  );

  const setWorkspaceActiveEnvId = useCallback(
    (wsId: string, envId: string | null) => {
      updateNodeInCollection(wsId, (node) => {
        if (node.type !== 'workspace' || !node.workspaceConfig) return node;
        return {
          ...node,
          workspaceConfig: { ...node.workspaceConfig, activeEnvironmentId: envId }
        };
      });
    },
    [updateNodeInCollection]
  );

  const applyVariables = useCallback(
    (text: string, targetNodeId: string): string => {
      if (!text || typeof text !== 'string') return text;

      // Helper to find path to node
      const getPath = (current: CollectionNode[], id: string, currentPath: CollectionNode[]): CollectionNode[] | null => {
        for (const node of current) {
          if (node.id === id) return [...currentPath, node];
          if (node.children) {
            const path = getPath(node.children, id, [...currentPath, node]);
            if (path) return path;
          }
        }
        return null;
      };

      let result = text;
      let iterations = 0;
      const MAX_ITERATIONS = 5;

      const path = getPath(collection, targetNodeId, []);
      const activeEnv = getActiveEnvironment(targetNodeId);

      while (result.includes('{{') && iterations < MAX_ITERATIONS) {
        const nextResult = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const trimmedKey = key.trim();

          // 1. Check Folder Hierarchy (Bottom-Up)
          if (path) {
            for (let i = path.length - 1; i >= 0; i--) {
              const node = path[i];
              if (node.type === 'folder' && node.folderConfig?.variables) {
                const v = node.folderConfig.variables.find(v => v.key === trimmedKey);
                if (v) return String(v.value ?? '');
              }
            }
          }

          // 2. Check Active Environment
          if (activeEnv) {
            const envVar = activeEnv.variables.find(v => v.key === trimmedKey);
            if (envVar) return String(envVar.value ?? '');
          }

          // 3. Check Global Variables
          const gv = globalVariables.find(v => v.key === trimmedKey);
          if (gv) return String(gv.value ?? '');

          return match;
        });

        if (nextResult === result) break;
        result = nextResult;
        iterations++;
      }
      return result;
    },
    [collection, globalVariables, getActiveEnvironment]
  );

  const removeEnv = useCallback(
    (eId: string, activeNodeId: string | null, editingEnvId: string | null, setEditingEnvId: (id: string | null) => void) => {
      if (!activeNodeId) return;
      const ws = findParentWorkspace(activeNodeId);
      if (!ws) return;
      updateNodeInCollection(ws.id, (node) => {
        if (node.type !== 'workspace' || !node.workspaceConfig) return node;
        return {
          ...node,
          workspaceConfig: {
            ...node.workspaceConfig,
            environments: node.workspaceConfig.environments.filter(e => e.id !== eId),
            activeEnvironmentId: node.workspaceConfig.activeEnvironmentId === eId ? null : node.workspaceConfig.activeEnvironmentId
          }
        };
      });
      if (editingEnvId === eId) setEditingEnvId(null);
    },
    [findParentWorkspace, updateNodeInCollection]
  );

  const addEnv = useCallback(
    (activeNodeId: string | null, setEditingEnvId: (id: string) => void) => {
      if (!activeNodeId) return;
      const ws = findParentWorkspace(activeNodeId);
      if (!ws) return;
      const freshId = uuidv4();
      updateNodeInCollection(ws.id, (node) => {
        if (node.type !== 'workspace' || !node.workspaceConfig) return node;
        return {
          ...node,
          workspaceConfig: {
            ...node.workspaceConfig,
            environments: [...node.workspaceConfig.environments, { id: freshId, name: 'Novo Ambiente', variables: [] }]
          }
        };
      });
      setEditingEnvId(freshId);
    },
    [findParentWorkspace, updateNodeInCollection]
  );

  return {
    getActiveEnvironment,
    getWorkspaceEnvironments,
    getWorkspaceActiveEnvId,
    setWorkspaceActiveEnvId,
    applyVariables,
    addEnv,
    removeEnv,
  };
};
