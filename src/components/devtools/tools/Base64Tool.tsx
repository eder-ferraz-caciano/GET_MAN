import React, { useState, useEffect } from 'react';
import { Copy, Trash2 } from 'lucide-react';

interface Base64ToolProps {
  onBack?: () => void;
}

export const Base64Tool: React.FC<Base64ToolProps> = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setError(null);

    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
    } catch {
      if (mode === 'decode') {
        setError('Texto Base64 inválido');
        setOutput('');
      } else {
        setError('Erro ao codificar');
        setOutput('');
      }
    }
  }, [input, mode]);

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const inputPlaceholder = mode === 'encode' ? 'Digite o texto para codificar' : 'Cole o texto Base64 para decodificar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setMode('encode')}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'encode' ? 'var(--accent-primary)' : 'transparent',
            color: mode === 'encode' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (mode !== 'encode') {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== 'encode') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Codificar
        </button>
        <button
          onClick={() => setMode('decode')}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'decode' ? 'var(--accent-primary)' : 'transparent',
            color: mode === 'decode' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (mode !== 'decode') {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== 'decode') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Decodificar
        </button>
      </div>

      {/* Input Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Entrada
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '12px',
            minHeight: '140px',
            resize: 'vertical',
            fontWeight: '500',
            wordBreak: 'break-all',
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {error}
        </div>
      )}

      {/* Output Section */}
      {!error && output && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Saída
            </label>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                backgroundColor: copySuccess ? 'rgb(34, 197, 94)' : 'var(--bg-panel)',
                border: `1px solid ${copySuccess ? 'rgb(34, 197, 94)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                color: copySuccess ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                if (!copySuccess) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!copySuccess) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
              title={copySuccess ? 'Copiado!' : 'Copiar saída'}
            >
              <Copy size={14} />
              {copySuccess ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '12px',
              minHeight: '140px',
              resize: 'vertical',
              fontWeight: '500',
              wordBreak: 'break-all',
              cursor: 'default',
              opacity: 0.9,
            }}
          />
        </div>
      )}

      {/* Empty State */}
      {!error && !output && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Digite ou cole algum texto acima
        </div>
      )}

      {/* Action Buttons */}
      {input && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
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
            title="Limpar entrada e saída"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};
