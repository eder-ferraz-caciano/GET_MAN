import React, { useState, useEffect } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import SparkMD5 from 'spark-md5';

interface HashCalculatorProps {
  onBack?: () => void;
}

export const HashCalculator: React.FC<HashCalculatorProps> = () => {
  const [text, setText] = useState('');
  const [md5Hash, setMd5Hash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setError(null);

    if (!text) {
      setMd5Hash(null);
      return;
    }

    try {
      const hash = SparkMD5.hash(text);
      setMd5Hash(hash);
    } catch {
      setError('Erro ao calcular hash MD5');
      setMd5Hash(null);
    }
  }, [text]);

  const handleCopy = async () => {
    if (!md5Hash) return;

    try {
      await navigator.clipboard.writeText(md5Hash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleClear = () => {
    setText('');
    setMd5Hash(null);
    setError(null);
  };

  const charCount = text.length;
  const byteCount = new TextEncoder().encode(text).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          Texto para gerar hash
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Insira o texto para gerar hash"
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
        {text && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              gap: '16px',
            }}
          >
            <span>Caracteres: {charCount}</span>
            <span>Bytes: {byteCount}</span>
          </div>
        )}
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

      {/* Hash Output Section */}
      {!error && md5Hash && (
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
              Hash MD5
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
              title={copySuccess ? 'Copiado!' : 'Copiar hash'}
            >
              <Copy size={14} />
              {copySuccess ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: '500',
              wordBreak: 'break-all',
              userSelect: 'text',
              cursor: 'text',
            }}
          >
            {md5Hash}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && !md5Hash && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Digite ou cole algum texto acima para gerar o hash
        </div>
      )}

      {/* Action Buttons */}
      {text && (
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
