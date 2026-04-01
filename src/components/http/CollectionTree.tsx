import React, { useState, useRef, Fragment } from 'react';
import { useRequestContext } from '../../context/RequestContext';
import { useCollection } from '../../hooks/useCollection';
import {
  Folder, Download, Upload, Trash2, Edit2, FilePlus,
  ChevronRight, ChevronDown, CopyPlus, Globe, MoreHorizontal, Database, AlertTriangle
} from 'lucide-react';
import type { CollectionNode, HistoryEntry } from '../../types';

interface CollectionTreeProps {
  exportCollection: () => Promise<void>;
  importCollection: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CollectionTree: React.FC<CollectionTreeProps> = ({ exportCollection: exportCollectionProp, importCollection: importCollectionProp }) => {
  const {
    collection, sidebarTab, treeSearchQuery, activeNodeId, setActiveNodeId,
    setSidebarTab, setTreeSearchQuery
  } = useRequestContext();

  // States local to this component
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [openMenuNodeId, setOpenMenuNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string, name: string } | null>(null);
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const draggedNodeIdRef = useRef<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ id: string, position: 'top' | 'bottom' | 'inside' } | null>(null);

  // Initialize useCollection hook with our states
  const {
    toggleFolder, addFolderTo, addRequestToFolder, addWorkspace,
    addWebSocketToFolder, cloneRequest, confirmDelete, startRename, commitRename, handleDrop,
    findParentWorkspace, getWorkspaceHistory
  } = useCollection({
    editingNodeId, setEditingNodeId,
    editingName, setEditingName,
    nodeToDelete, setNodeToDelete,
    draggedNodeIdRef,
    newWorkspaceName, setNewWorkspaceName,
    setShowNewWorkspaceInput,
  });

  const switchActiveNode = (nodeId: string | null) => {
    setActiveNodeId(nodeId);
  };

  // Tree rendering function
  const renderTree = (nodes: CollectionNode[], depth = 0) => {
    return nodes.map((node) => (
      <Fragment key={node.id}>
        <div
          className={`tree-item ${node.type === 'workspace' ? 'workspace-node' : ''} ${activeNodeId === node.id ? 'active-node' : ''} ${dragOverInfo?.id === node.id ? `drag-over-${dragOverInfo.position}` : ''}`}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', node.id);
            e.dataTransfer.setData('text/uri-list', 'http://aurafetch.io/' + node.id);
            draggedNodeIdRef.current = node.id;
            document.body.classList.add('dragging-active');
            e.currentTarget.classList.add('is-dragging');
          }}
          onDragEnd={(e) => {
            draggedNodeIdRef.current = null;
            setDragOverInfo(null);
            document.body.classList.remove('dragging-active');
            e.currentTarget.classList.remove('is-dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
          }}
          onDragOver={(e) => {
            if (draggedNodeIdRef.current) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              let position: 'top' | 'bottom' | 'inside' = 'bottom';
              if (y < rect.height / 3) position = 'top';
              else if ((node.type === 'folder' || node.type === 'workspace') && y > rect.height / 3 && y < (rect.height * 2) / 3) position = 'inside';
              else position = 'bottom';
              if (dragOverInfo?.id !== node.id || dragOverInfo?.position !== position) {
                setDragOverInfo({ id: node.id, position });
              }
            }
          }}
          onDragEnter={(e) => {
            if (draggedNodeIdRef.current && draggedNodeIdRef.current !== node.id) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDragLeave={() => { if (dragOverInfo?.id === node.id) setDragOverInfo(null); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverInfo(null);
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const isTop = y < rect.height / 3;
            const isInside = node.type === 'folder' && y >= rect.height / 3 && y <= (rect.height * 2) / 3;
            const dId = e.dataTransfer.getData('text/plain') || draggedNodeIdRef.current;
            if (dId) handleDrop(node.id, isInside, isTop);
          }}
          onClick={() => { switchActiveNode(node.id); setOpenMenuNodeId(null); }}
          style={{ paddingLeft: `${depth * 14 + 8}px`, opacity: draggedNodeIdRef.current === node.id ? 0.3 : 1 }}
        >
          {/* ── Conteúdo ── */}
          <div className="tree-item-content">
            {(node.type === 'folder' || node.type === 'workspace') && (
              <span
                className="expander-icon"
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); toggleFolder(node.id); }}
              >
                {node.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}

            {node.type === 'workspace' ? (
              <Database size={14} className="text-accent" style={{ opacity: 0.9, flexShrink: 0 }} />
            ) : node.type === 'folder' ? (
              <Folder size={14} className="text-accent" style={{ opacity: 0.8, flexShrink: 0 }} />
            ) : (
              <span className={`method-tag method-${node.request!.method}`}>
                {node.request!.method}
              </span>
            )}

            {/* Workspace env badge */}
            {node.type === 'workspace' && node.workspaceConfig && (() => {
              const activeEnv = node.workspaceConfig.environments.find(e => e.id === node.workspaceConfig!.activeEnvironmentId);
              return (
                <span className={`workspace-env-badge ${activeEnv ? '' : 'no-env'}`}>
                  <span className="env-dot" />
                  {activeEnv ? activeEnv.name : 'Sem Amb.'}
                </span>
              );
            })()}

            {editingNodeId === node.id ? (
              <input
                autoFocus
                className="rename-input"
                value={editingName}
                onClick={e => e.stopPropagation()}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename(node.id);
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                onBlur={() => commitRename(node.id)}
              />
            ) : (
              <span
                className={`node-name ${node.type === 'folder' ? 'folder-label' : ''}`}
                onDoubleClick={(e) => startRename(node.id, node.name, e as any)}
                title={node.name}
              >
                {node.name}
              </span>
            )}
          </div>

          {/* ── Menu trigger (único botão "⋮") ── */}
          <div className="tree-item-menu-trigger">
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuNodeId(openMenuNodeId === node.id ? null : node.id);
              }}
              title="Opções"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>

          {/* ── Dropdown Menu ── */}
          {openMenuNodeId === node.id && (
            <div className="tree-dropdown-menu" onClick={(e) => e.stopPropagation()}>
              {(node.type === 'folder' || node.type === 'workspace') && (
                <>
                  <button onClick={() => { addRequestToFolder(node.id); setOpenMenuNodeId(null); }}>
                    <FilePlus size={13} /> Nova Requisição
                  </button>
                  <button onClick={() => { addWebSocketToFolder(node.id); setOpenMenuNodeId(null); }}>
                    <Globe size={13} /> Nova Conexão WS
                  </button>
                  <button onClick={() => { addFolderTo(node.id); setOpenMenuNodeId(null); }}>
                    <Folder size={13} /> Nova Pasta
                  </button>
                </>
              )}
              {node.type === 'request' && (
                <button onClick={() => { cloneRequest(node.id); setOpenMenuNodeId(null); }}>
                  <CopyPlus size={13} /> Duplicar
                </button>
              )}
              <button onClick={(e) => { startRename(node.id, node.name, e); setOpenMenuNodeId(null); }}>
                <Edit2 size={12} /> Renomear
              </button>
              <button className="danger" onClick={() => { setNodeToDelete({ id: node.id, name: node.name }); setOpenMenuNodeId(null); }}>
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          )}
        </div>
        {(node.type === 'folder' || node.type === 'workspace') && node.expanded && node.children && (
          <div className="tree-children-container" key={`${node.id}-children`}>
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </Fragment>
    ));
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 1. Header (Fixed Top) */}
      <div style={{ padding: '20px 16px 14px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="app-title" onClick={() => switchActiveNode(null)} style={{ cursor: 'pointer', margin: 0 }}>
            <span className="highlight">Aura</span>Fetch
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '2px' }}>Pesquisar</label>
          <input
            type="text"
            value={treeSearchQuery}
            onChange={e => setTreeSearchQuery(e.target.value)}
            placeholder="Buscar requisição, pasta..."
            className="text-input"
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-strong)', padding: '6px 10px', fontSize: '13px', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Sidebar Tabs for Coleção vs Histórico */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => setSidebarTab('collection')}
          style={{ flex: 1, padding: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: sidebarTab === 'collection' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: sidebarTab === 'collection' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          Coleções
        </button>
        <button
          onClick={() => setSidebarTab('history')}
          style={{ flex: 1, padding: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: sidebarTab === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: sidebarTab === 'history' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          Histórico
        </button>
      </div>

      {sidebarTab === 'collection' ? (
        <>
          {/* 2. Collection Actions Bar (Fixed Below Sidebar Header) */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coleção</span>
            <div className="sidebar-actions" style={{ gap: '2px' }}>
              <button className="btn-icon" onClick={() => setShowNewWorkspaceInput(true)} title="Novo Workspace" style={{ padding: '5px' }}><Database size={14} /></button>
              <button className="btn-icon" onClick={exportCollectionProp} title="Exportar" style={{ padding: '5px' }}><Download size={14} /></button>
              <label className="btn-icon" style={{ cursor: 'pointer', margin: 0, padding: '5px' }} title="Importar">
                <Upload size={14} />
                <input type="file" accept=".json" onChange={importCollectionProp} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          {showNewWorkspaceInput ? (
            <div style={{ display: 'flex', gap: '4px', padding: '4px 8px' }}>
              <input
                className="text-input"
                placeholder="Nome do workspace..."
                value={newWorkspaceName}
                autoFocus
                onChange={e => setNewWorkspaceName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addWorkspace();
                  if (e.key === 'Escape') { setShowNewWorkspaceInput(false); setNewWorkspaceName(''); }
                }}
                style={{ flex: 1, fontSize: '12px', padding: '4px 8px' }}
              />
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={addWorkspace}>OK</button>
            </div>
          ) : null}

          {/* 3. Scrollable Tree Area */}
          <div
            className="sidebar-tree-container"
            style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'auto', minHeight: '100px' }}
            onDragOver={(e) => {
              if (draggedNodeIdRef.current) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDragEnter={(e) => {
              if (draggedNodeIdRef.current) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedNodeIdRef.current) {
                handleDrop(null, false);
              }
            }}
          >
            {(() => {
              if (!treeSearchQuery.trim()) return renderTree(collection);

              const query = treeSearchQuery.toLowerCase();
              const filterNodes = (nodes: CollectionNode[]): CollectionNode[] => {
                return nodes.reduce((acc: CollectionNode[], node) => {
                  const matches = node.name.toLowerCase().includes(query);
                  const children = node.children ? filterNodes(node.children) : [];

                  if (matches || children.length > 0) {
                    acc.push({ ...node, children, expanded: children.length > 0 ? true : node.expanded });
                  }
                  return acc;
                }, []);
              };

              const filtered = filterNodes(collection);
              return filtered.length > 0
                ? renderTree(filtered)
                : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Nenhum resultado encontrado.</div>;
            })()}
            <div style={{ height: '80px', pointerEvents: 'none' }} />
          </div>
        </>
      ) : (
        <div className="sidebar-history-container" style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', background: 'rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recentes</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {activeNodeId ? (findParentWorkspace(activeNodeId)?.name || '') : ''}
            </span>
          </div>
          {(() => {
            const wsHistory = activeNodeId ? getWorkspaceHistory(activeNodeId) : [];
            if (wsHistory.length === 0) return (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                <svg style={{ opacity: 0.1, marginBottom: '12px', width: '32px', height: '32px' }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>
                <p>Nenhuma requisição feita recentemente.</p>
              </div>
            );
            return wsHistory.map((entry: HistoryEntry) => (
              <div
                key={entry.id}
                className="history-card"
                onClick={() => switchActiveNode(entry.requestId)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`method-${entry.method}`} style={{ fontSize: '10px', fontWeight: 900 }}>{entry.method}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: entry.status >= 200 && entry.status < 300 ? 'var(--success)' : 'var(--text-error)' }}>
                    {entry.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.requestName}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{entry.url}</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {nodeToDelete && (
        <div className="modal-overlay" onClick={() => setNodeToDelete(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--danger)', marginBottom: '16px' }}>
              <AlertTriangle size={28} />
              <h3 style={{ margin: 0, fontSize: '20px', letterSpacing: '-0.3px' }}>Confirmar Eliminação</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
              A deleção do item <strong style={{ color: 'var(--text-primary)' }}>"{nodeToDelete.name}"</strong> será irremovível. Pastas aninhadas também encontrarão seu fim. Prossigo?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setNodeToDelete(null)}>Repensar 🤔</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Deletar Logo 💥</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
