import { useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';

interface WebSocketPanelProps {
  activeReq: any;
  wsMessages: any[];
  wsInputMessage: string;
  setWsInputMessage: (message: string) => void;
  wsConnected: boolean;
  sendWsMessage: () => void;
  handleActiveReqChange: (updates: any) => void;
}

const AutoScrollEnd = ({ dependency }: { dependency: any }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dependency]);
  return <div ref={endRef} />;
};

export function WebSocketPanel({
  activeReq,
  wsMessages,
  wsInputMessage,
  setWsInputMessage,
  wsConnected,
  sendWsMessage,
  handleActiveReqChange,
}: WebSocketPanelProps) {
  if (!activeReq || activeReq.method !== 'WS') {
    return null;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-panel-solid)', height: '100%' }}>
      <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)' }}>
        {(wsMessages || []).length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Conecte a um WebSocket para começar a enviar mensagens.</div>
        )}
        {(wsMessages || []).map(m => (
          <div key={m.id} style={{
            alignSelf: m.type === 'sent' ? 'flex-end' : (m.type === 'received' ? 'flex-start' : 'center'),
            background: m.type === 'sent' ? 'var(--accent-primary)' : (m.type === 'received' ? 'rgba(255,255,255,0.05)' : 'transparent'),
            color: m.type === 'info' ? 'var(--text-muted)' : (m.type === 'error' ? 'var(--danger)' : '#fff'),
            padding: m.type === 'info' || m.type === 'error' ? '4px' : '10px 14px',
            borderRadius: '8px',
            maxWidth: '80%',
            fontSize: '13px',
            border: m.type === 'received' ? '1px solid var(--border-strong)' : 'none',
            boxShadow: m.type === 'sent' ? '0 4px 10px rgba(99,102,241,0.2)' : 'none'
          }}>
            {m.type === 'sent' ? <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '8px' }}>⇧ Enviado</span> : ''}
            {m.type === 'received' ? <span style={{ fontSize: '10px', opacity: 0.5, marginRight: '8px', color: 'var(--success)' }}>⇩ Recebido</span> : ''}
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>{m.text}</pre>
          </div>
        ))}
        <AutoScrollEnd dependency={wsMessages} />
      </div>
      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
        <textarea
          value={wsInputMessage}
          onChange={e => setWsInputMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendWsMessage(); }
          }}
          placeholder="Escreva a mensagem (Enter para enviar)..."
          className="text-input"
          style={{ minHeight: '44px', height: '44px', resize: 'none' }}
        />
        <button className="btn btn-primary" onClick={sendWsMessage} disabled={!wsConnected || !wsInputMessage.trim()}>
          <Send size={16} />
        </button>
        <button className="btn btn-secondary" onClick={() => handleActiveReqChange({ wsMessages: [] })}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
