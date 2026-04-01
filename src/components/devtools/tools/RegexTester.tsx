import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

interface RegexMatch {
  text: string;
  index: number;
}

interface Flags {
  g: boolean;
  i: boolean;
  m: boolean;
}

interface RegexTesterProps {
  onBack?: () => void;
}

const PRESETS = [
  {
    name: 'Email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/[^\\s]+',
  },
  {
    name: 'Números',
    pattern: '\\d+',
  },
  {
    name: 'Telefone',
    pattern: '\\(\\d{2}\\) \\d{4,5}-\\d{4}',
  },
  {
    name: 'Data',
    pattern: '\\d{2}\\/\\d{2}\\/\\d{4}',
  },
];

export const RegexTester: React.FC<RegexTesterProps> = () => {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [flags, setFlags] = useState<Flags>({ g: true, i: false, m: false });
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  useEffect(() => {
    if (!pattern.trim() || !text.trim()) {
      setError(null);
      setMatches([]);
      return;
    }

    try {
      const flagsString = (flags.g ? 'g' : '') + (flags.i ? 'i' : '') + (flags.m ? 'm' : '');
      const regex = new RegExp(pattern, flagsString);
      const newMatches: RegexMatch[] = [];

      if (flags.g) {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          const matchText = match[0];
          const matchIndex = match.index;
          newMatches.push({
            text: matchText,
            index: matchIndex,
          });
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          newMatches.push({
            text: match[0],
            index: match.index,
          });
        }
      }

      setError(null);
      setMatches(newMatches);
    } catch {
      setError('Padrão inválido');
      setMatches([]);
    }
  }, [pattern, text, flags]);

  const handleFlagChange = (flag: keyof Flags) => {
    setFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const handlePreset = (presetPattern: string) => {
    setPattern(presetPattern);
  };

  const handleCopyMatch = async (matchText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(matchText);
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Pattern Input */}
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
          Padrão Regex
        </label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Insira o padrão regex aqui"
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: '500',
          }}
        />
      </div>

      {/* Flags Section */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Flags
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['g', 'i', 'm'] as const).map((flag) => (
            <label
              key={flag}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={() => handleFlagChange(flag)}
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                }}
              />
              <span style={{ fontWeight: '500' }}>{flag.toUpperCase()}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginLeft: '4px',
                }}
              >
                {flag === 'g'
                  ? '(global)'
                  : flag === 'i'
                    ? '(insensível)'
                    : '(multilinha)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Text Textarea */}
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
          Texto para Testar
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Insira o texto para testar"
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '12px',
            minHeight: '120px',
            resize: 'vertical',
            fontWeight: '500',
            wordBreak: 'break-all',
          }}
        />
      </div>

      {/* Presets */}
      {pattern === '' && (
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
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset.pattern)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                title={`Carregar: ${preset.pattern}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Matches Results */}
      {!error && (pattern.trim() || text.trim()) && (
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
              Resultados
            </label>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--accent-primary)',
              }}
            >
              {matches.length} encontrado{matches.length !== 1 ? 's' : ''}
            </span>
          </div>

          {matches.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                      wordBreak: 'break-all',
                      marginRight: '8px',
                    }}
                  >
                    <div>{match.text}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      Índice: {match.index}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyMatch(match.text, idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 10px',
                      backgroundColor:
                        copySuccess === idx
                          ? 'rgb(34, 197, 94)'
                          : 'var(--bg-panel)',
                      border: `1px solid ${
                        copySuccess === idx
                          ? 'rgb(34, 197, 94)'
                          : 'var(--border-color)'
                      }`,
                      borderRadius: '4px',
                      color:
                        copySuccess === idx
                          ? 'white'
                          : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (copySuccess !== idx) {
                        e.currentTarget.style.backgroundColor =
                          'var(--accent-primary)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor =
                          'var(--accent-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copySuccess !== idx) {
                        e.currentTarget.style.backgroundColor =
                          'var(--bg-panel)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor =
                          'var(--border-color)';
                      }
                    }}
                    title={copySuccess === idx ? 'Copiado!' : 'Copiar'}
                  >
                    <Copy size={14} />
                    {copySuccess === idx ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ))}
            </div>
          ) : pattern.trim() && text.trim() ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 20px',
                color: 'var(--text-muted)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            >
              Nenhuma correspondência encontrada
            </div>
          ) : null}
        </div>
      )}

      {/* Empty State */}
      {!error && !pattern.trim() && !text.trim() && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Digite um padrão regex e o texto para testar
        </div>
      )}
    </div>
  );
};
