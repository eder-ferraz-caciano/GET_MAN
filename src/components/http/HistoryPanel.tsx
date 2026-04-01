import { Clock, Trash2 } from 'lucide-react';
import type { RequestModel } from '../../types';

interface HistoryPanelProps {
  history: any[];
  onSelectRequest: (req: RequestModel) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  history,
  onSelectRequest,
  onClearHistory,
}: HistoryPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} /> Histórico ({history?.length || 0})
        </span>
        {(history?.length || 0) > 0 && (
          <button className="btn-icon" onClick={onClearHistory} title="Limpar Histórico">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {(!history || history.length === 0) ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 8px', fontSize: '12px' }}>
            Nenhum histórico disponível.
          </div>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectRequest(item)}
              style={{
                padding: '8px 12px',
                margin: '4px 0',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--text-primary)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(99, 102, 241, 0.2)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(99, 102, 241, 0.1)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
            >
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.method} {item.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
                {item.url}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
