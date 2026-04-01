import { useRef, useEffect } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import type { LogEntry } from '../../types';

interface ConsoleProps {
  logs: LogEntry[] | undefined;
  onClear: () => void;
  onLogCopied?: (message: string) => void;
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

export function Console({ logs, onClear, onLogCopied }: ConsoleProps) {
  const list = logs || [];

  const handleCopyLogs = () => {
    const logsText = list.map(l => {
      const timestamp = l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp);
      return `[${timestamp.toLocaleTimeString()}] ${l.message}\n${l.data ? (typeof l.data === 'string' ? l.data : JSON.stringify(l.data, null, 2)) : ''}`
    }).join('\n\n');
    navigator.clipboard.writeText(logsText);
    if (onLogCopied) {
      onLogCopied('Logs copiados para a área de transferência!');
    }
  };

  return (
    <div className="console-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="console-header" style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', marginBottom: '0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Saídas e Rastros do Script</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={handleCopyLogs} title="Copiar Logs"><Copy size={14} /></button>
          <button className="btn-icon" onClick={onClear} title="Limpar Tudo"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="console-logs" style={{ height: '280px', overflowY: 'auto', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--border-subtle)' }}>
        {list.map((log) => {
          const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
          return (
            <div key={log.id} className={`log-line log-${log.type}`}>
              <span className="log-time" style={{ width: '70px', display: 'inline-block' }}>[{timestamp.toLocaleTimeString()}]</span>
              <span className="log-msg" style={{ flex: 1 }}>{log.message}</span>
              {log.data && (
                <pre style={{ width: '100%', overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: '4px', fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          )
        })}
        {list.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px', fontStyle: 'italic', fontSize: '13px' }}>
            Nenhum log disponível.
          </div>
        )}
        <AutoScrollEnd dependency={list} />
      </div>
    </div>
  );
}
