import React, { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface UUIDGeneratorProps {
  onBack?: () => void;
}

export const UUIDGenerator: React.FC<UUIDGeneratorProps> = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);

  const generateUUIDs = (count: number) => {
    const newUuids = Array.from({ length: count }, () => uuidv4());
    setUuids([...uuids, ...newUuids]);
    setCopySuccess(null);
    setCopyAllSuccess(false);
  };

  const handleCopySingle = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopySuccess(uuid);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleCopyAll = async () => {
    if (uuids.length === 0) return;

    try {
      const allText = uuids.join('\n');
      await navigator.clipboard.writeText(allText);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleClear = () => {
    setUuids([]);
    setCopySuccess(null);
    setCopyAllSuccess(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => generateUUIDs(1)}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Gerar 1
        </button>

        <button
          onClick={() => generateUUIDs(10)}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Gerar 10
        </button>

        <button
          onClick={() => generateUUIDs(100)}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Gerar 100
        </button>

        {uuids.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgb(239, 68, 68)';
              e.currentTarget.style.color = 'rgb(239, 68, 68)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <Trash2 size={16} />
            Limpar
          </button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="tool-output" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: '600',
            }}
          >
            {uuids.length} UUID{uuids.length !== 1 ? 's' : ''} gerado{uuids.length !== 1 ? 's' : ''}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '8px',
            }}
          >
            {uuids.map((uuid, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                  }}
                >
                  {uuid}
                </code>
                <button
                  onClick={() => handleCopySingle(uuid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 10px',
                    backgroundColor: copySuccess === uuid ? 'rgb(34, 197, 94)' : 'var(--bg-panel)',
                    border: `1px solid ${copySuccess === uuid ? 'rgb(34, 197, 94)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    color: copySuccess === uuid ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (copySuccess !== uuid) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (copySuccess !== uuid) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                  }}
                  title={copySuccess === uuid ? 'Copiado!' : 'Copiar UUID'}
                >
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCopyAll}
            style={{
              padding: '10px 16px',
              backgroundColor: copyAllSuccess ? 'rgb(34, 197, 94)' : 'var(--bg-panel)',
              border: `1px solid ${copyAllSuccess ? 'rgb(34, 197, 94)' : 'var(--border-color)'}`,
              borderRadius: '4px',
              color: copyAllSuccess ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!copyAllSuccess) {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copyAllSuccess) {
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            <Copy size={16} />
            {copyAllSuccess ? 'Copiado!' : 'Copiar Tudo'}
          </button>
        </div>
      )}

      {uuids.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Clique em um dos botões acima para gerar UUIDs
        </div>
      )}
    </div>
  );
};
