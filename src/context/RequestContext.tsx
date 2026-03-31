/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CollectionNode, EnvVar, LogEntry, SavedResponse, LegacyWorkspace, Environment } from '../types';

// ============================================================================
// MIGRATION HELPERS & INITIAL DATA
// ============================================================================

const defaultRequest = {
  id: uuidv4(),
  name: 'Nova Requisição',
  method: 'GET' as const,
  url: '{{base_url}}/todos/1',
  auth: { type: 'inherit' as const },
  headers: [
    { id: uuidv4(), key: 'Content-Type', value: 'application/json', enabled: true },
    { id: uuidv4(), key: 'Accept', value: 'application/json', enabled: true }
  ],
  queryParams: [],
  params: [],
  body: '',
  bodyType: 'json' as const,
  formData: [],
  binaryFile: null
};

const initialCollection: CollectionNode[] = [
  {
    id: 'ws_default',
    name: 'Workspace Padrão',
    type: 'workspace',
    expanded: true,
    workspaceConfig: {
      environments: [
        { id: 'env_dev', name: 'Ambiente DEV', variables: [{ id: uuidv4(), key: 'base_url', value: 'http://localhost:3000' }] },
        { id: 'env_prod', name: 'Ambiente PROD', variables: [{ id: uuidv4(), key: 'base_url', value: 'https://api.myapp.com' }] }
      ],
      activeEnvironmentId: 'env_dev',
      history: []
    },
    children: [
      {
        id: '1',
        name: 'Meu Servidor/Projeto',
        type: 'folder',
        expanded: true,
        folderConfig: {
          auth: { type: 'bearer', token: '{{token_acesso}}' },
          variables: []
        },
        children: [
          {
            id: '1a',
            name: 'Listar Dados (Rota GET)',
            type: 'request',
            request: { ...defaultRequest, id: '1a', name: 'Listar Dados (Rota GET)', headers: defaultRequest.headers.map(h => ({ ...h })) }
          }
        ]
      }
    ]
  }
];

// Migration helper: convert legacy workspace format to new tree format
const migrateWorkspacesToTreeFormat = (): CollectionNode[] | null => {
  try {
    const savedV2 = localStorage.getItem('aurafetch_collection_v2');
    if (savedV2) return JSON.parse(savedV2);
  } catch (e) {
    console.warn('[AuraFetch] Coleção v2 corrompida, limpando...', e);
    localStorage.removeItem('aurafetch_collection_v2');
  }

  try {
    const savedOldWs = localStorage.getItem('aurafetch_workspaces');
    if (savedOldWs) {
      const oldWorkspaces: LegacyWorkspace[] = JSON.parse(savedOldWs);
      return oldWorkspaces.map(ws => ({
        id: ws.id,
        name: ws.name,
        type: 'workspace' as const,
        expanded: true,
        workspaceConfig: {
          environments: ws.environments || [],
          activeEnvironmentId: ws.activeEnvironmentId,
          history: ws.history || []
        },
        children: ws.collection || []
      }));
    }
  } catch (e) {
    console.warn('[AuraFetch] Workspaces legados corrompidos, limpando...', e);
    localStorage.removeItem('aurafetch_workspaces');
  }

  try {
    const oldCol = localStorage.getItem('aurafetch_collection');
    if (oldCol) {
      let parsedEnvs: Environment[] = [];
      try {
        const oldEnvs = localStorage.getItem('aurafetch_envs');
        parsedEnvs = oldEnvs ? JSON.parse(oldEnvs) : [];
      } catch { /* envs corrompidos, usar vazio */ }

      return [{
        id: 'ws_default',
        name: 'Workspace Padrão',
        type: 'workspace' as const,
        expanded: true,
        workspaceConfig: {
          environments: parsedEnvs,
          activeEnvironmentId: localStorage.getItem('aurafetch_env_active') || null,
          history: []
        },
        children: JSON.parse(oldCol)
      }];
    }
  } catch (e) {
    console.warn('[AuraFetch] Coleção legada corrompida, limpando...', e);
    localStorage.removeItem('aurafetch_collection');
    localStorage.removeItem('aurafetch_envs');
    localStorage.removeItem('aurafetch_env_active');
  }

  return null;
};

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface RequestContextValue {
  collection: CollectionNode[];
  setCollection: React.Dispatch<React.SetStateAction<CollectionNode[]>>;
  sidebarTab: 'collection' | 'history';
  setSidebarTab: React.Dispatch<React.SetStateAction<'collection' | 'history'>>;
  treeSearchQuery: string;
  setTreeSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  globalVariables: EnvVar[];
  setGlobalVariables: React.Dispatch<React.SetStateAction<EnvVar[]>>;
  activeNodeId: string | null;
  setActiveNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  activeResponse: SavedResponse | null;
  setActiveResponse: React.Dispatch<React.SetStateAction<SavedResponse | null>>;
  activeLogs: LogEntry[];
  setActiveLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  addLog: (type: LogEntry['type'], message: string, data?: any) => void;
  wsConnected: boolean;
  setWsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  wsInputMessage: string;
  setWsInputMessage: React.Dispatch<React.SetStateAction<string>>;
}

const RequestContext = createContext<RequestContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collection, setCollection] = useState<CollectionNode[]>(() => {
    const migrated = migrateWorkspacesToTreeFormat();
    return migrated || initialCollection;
  });

  const [sidebarTab, setSidebarTab] = useState<'collection' | 'history'>('collection');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');

  const [globalVariables, setGlobalVariables] = useState<EnvVar[]>(() => {
    try {
      const saved = localStorage.getItem('aurafetch_globals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('[AuraFetch] Variáveis globais corrompidas, limpando...', e);
      localStorage.removeItem('aurafetch_globals');
      return [];
    }
  });

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeResponse, setActiveResponse] = useState<SavedResponse | null>(null);
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsInputMessage, setWsInputMessage] = useState('');

  const addLog = useCallback((type: LogEntry['type'], message: string, data?: any) => {
    const newLog: LogEntry = { id: uuidv4(), timestamp: new Date(), type, message, data };
    setActiveLogs(prev => [...prev, newLog]);
  }, []);

  // Persist collection and global variables to localStorage
  React.useEffect(() => {
    localStorage.setItem('aurafetch_collection_v2', JSON.stringify(collection));
    localStorage.setItem('aurafetch_globals', JSON.stringify(globalVariables));
  }, [collection, globalVariables]);

  return (
    <RequestContext.Provider value={{
      collection, setCollection,
      sidebarTab, setSidebarTab,
      treeSearchQuery, setTreeSearchQuery,
      globalVariables, setGlobalVariables,
      activeNodeId, setActiveNodeId,
      activeResponse, setActiveResponse,
      activeLogs, setActiveLogs, addLog,
      wsConnected, setWsConnected,
      wsInputMessage, setWsInputMessage,
    }}>
      {children}
    </RequestContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useRequestContext = () => {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error('useRequestContext must be used within RequestProvider');
  return ctx;
};
