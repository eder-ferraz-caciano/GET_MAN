import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import cronstrue from 'cronstrue';

interface CronHelperProps {
  onBack?: () => void;
}

interface CronExample {
  label: string;
  expression: string;
}

const CRON_EXAMPLES: CronExample[] = [
  { label: 'Cada minuto', expression: '* * * * *' },
  { label: 'A cada hora', expression: '0 * * * *' },
  { label: 'Diariamente às 9:00', expression: '0 9 * * *' },
  { label: 'Segunda-feira às 9:00', expression: '0 9 * * 1' },
  { label: '1º dia do mês', expression: '0 0 1 * *' },
];

export const CronHelper: React.FC<CronHelperProps> = () => {
  const [expression, setExpression] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const parseCronExpression = (expr: string) => {
    setError(null);
    setDescription(null);

    if (!expr.trim()) {
      return;
    }

    try {
      const result = cronstrue.toString(expr, { locale: 'pt_BR' });
      setDescription(result);
    } catch {
      setError('Expressão cron inválida');
    }
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (expression.trim()) {
        parseCronExpression(expression);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [expression]);

  const handleExampleClick = (exampleExpression: string) => {
    setExpression(exampleExpression);
  };

  const handleCopy = async () => {
    if (!expression) return;

    try {
      await navigator.clipboard.writeText(expression);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleClear = () => {
    setExpression('');
    setDescription(null);
    setError(null);
  };

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
          Expressão Cron
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Insira uma expressão cron aqui"
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: '500',
          }}
        />
      </div>

      {/* Examples Section */}
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
          Exemplos
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '8px',
          }}
        >
          {CRON_EXAMPLES.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.expression)}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
              title={example.expression}
            >
              {example.label}
            </button>
          ))}
        </div>
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

      {/* Description Section */}
      {!error && description && (
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
              Descrição
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
              title={copySuccess ? 'Copiado!' : 'Copiar expressão'}
            >
              <Copy size={14} />
              {copySuccess ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.6',
              fontWeight: '500',
            }}
          >
            {description}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && !description && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Digite ou clique em um exemplo para decodificar
        </div>
      )}

      {/* Action Buttons */}
      {expression && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
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
            title="Limpar expressão"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};
