import {
  Send, Square, Play, Clock, Terminal, Globe
} from 'lucide-react';
import type { HttpMethod } from '../../types';

interface RequestBuilderProps {
  activeReq: any;
  handleActiveReqChange: (updates: any) => void;
  loading: boolean;
  wsConnected: boolean;
  handleSend: () => void;
  cancelReq: () => void;
  setIsCodeModalOpen: (open: boolean) => void;
  intervalMs: number;
  setIntervalMs: (ms: number) => void;
  isLooping: boolean;
  setIsLooping: (loop: boolean) => void;
}

export function RequestBuilder({
  activeReq,
  handleActiveReqChange,
  loading,
  wsConnected,
  handleSend,
  cancelReq,
  setIsCodeModalOpen,
  intervalMs,
  setIntervalMs,
  isLooping,
  setIsLooping,
}: RequestBuilderProps) {
  return (
    <div className="workspace-header">
      <div className="url-bar-container" style={{ margin: 0, height: '44px', paddingLeft: '2px' }}>
        {activeReq!.method === 'WS' ? (
          <div style={{ padding: '0 16px', fontWeight: 900, fontSize: '14px', color: 'var(--accent-primary)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} /> WS
          </div>
        ) : (
          <>
            <select
              value={activeReq!.method}
              onChange={e => handleActiveReqChange({ method: e.target.value as HttpMethod })}
              className={`method-select method-${activeReq!.method}`}
              style={{ flexShrink: 0, width: '110px' }}
            >
              <option value="GET" className="method-GET">GET</option>
              <option value="POST" className="method-POST">POST</option>
              <option value="PUT" className="method-PUT">PUT</option>
              <option value="PATCH" className="method-PATCH">PATCH</option>
              <option value="DELETE" className="method-DELETE">DELETE</option>
            </select>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)' }} />
          </>
        )}
        <input
          type="text"
          value={activeReq!.url}
          onChange={e => handleActiveReqChange({ url: e.target.value })}
          placeholder={activeReq!.method === 'WS' ? "wss://echo.websocket.org..." : "{{base_url}}/api/..."}
          style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', flex: 1, background: 'transparent' }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
        />
      </div>

      {activeReq!.method === 'WS' ? (
        <button
          className={`btn ${wsConnected ? 'btn-danger' : 'btn-primary'} btn-send`}
          onClick={handleSend}
          disabled={loading}
        >
          <Globe size={16} /> {wsConnected ? 'Desconectar' : (loading ? 'Conectando...' : 'Conectar WS')}
        </button>
      ) : (
        <>
          <button className="btn btn-secondary" onClick={() => setIsCodeModalOpen(true)} title="Gerar Snippet de Código">
            <Terminal size={16} />
          </button>
          {loading && !isLooping ? (
            <button className="btn btn-danger btn-send" onClick={cancelReq} title="Cancelar Requisição">
              <Square size={16} fill="currentColor" /> Cancelar
            </button>
          ) : (
            <button className="btn btn-primary btn-send" onClick={handleSend} disabled={isLooping}>
              <Send size={16} /> Fazer Disparo
            </button>
          )}

          <div className="loop-controls">
            <span title="Disparo agendado / loop automático"><Clock size={16} className="text-muted" /></span>
            <input
              type="number"
              value={intervalMs}
              onChange={e => setIntervalMs(Math.max(100, Number(e.target.value)))}
              className="interval-input"
              title="Intervalo milissegundos"
              disabled={isLooping}
            />
            <button
              className={`btn ${isLooping ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '10px 14px' }}
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? "Parar LOOP Automático" : "Derrubar a API (Loop Auto)"}
            >
              {isLooping ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
