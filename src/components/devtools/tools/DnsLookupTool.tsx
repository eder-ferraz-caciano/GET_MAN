import React, { useState } from 'react';
import { Copy } from 'lucide-react';

interface DnsRecord {
  type: string;
  data: string[];
  error?: string;
}

interface DnsLookupToolProps {
  onBack?: () => void;
}

export const DnsLookupTool: React.FC<DnsLookupToolProps> = ({ onBack }) => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<Record<string, DnsRecord>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT'];

  const lookupDns = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError('Digite um domínio válido');
      return;
    }

    setLoading(true);
    setError(null);
    setResults({});

    const newResults: Record<string, DnsRecord> = {};

    for (const type of recordTypes) {
      try {
        const response = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
          {
            headers: { Accept: 'application/json' }
          }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.Answer) {
          newResults[type] = {
            type,
            data: data.Answer.map((record: any) => record.data)
          };
        } else {
          newResults[type] = {
            type,
            data: ['Sem registros encontrados']
          };
        }
      } catch (err) {
        newResults[type] = {
          type,
          data: [],
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(text);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <button onClick={onBack} className="tool-button" style={{ marginRight: 'auto' }}>
          ← Voltar
        </button>
      </div>

      <div className="tool-content">
        <form onSubmit={lookupDns} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="exemplo.com.br"
            className="tool-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="tool-button" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && <p style={{ color: 'var(--error-color)' }}>Erro: {error}</p>}

        {Object.keys(results).length > 0 && (
          <div>
            {recordTypes.map((type) => {
              const record = results[type];
              return (
                <div key={type} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                    Registros {type}
                  </h4>
                  {record.error ? (
                    <p style={{ color: 'var(--error-color)' }}>{record.error}</p>
                  ) : record.data.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Sem registros</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {record.data.map((data, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            marginBottom: '0.5rem',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                          }}
                        >
                          <span style={{ flex: 1 }}>{data}</span>
                          <button
                            onClick={() => handleCopy(data)}
                            className="tool-button"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            {copySuccess === data ? '✓' : <Copy size={14} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
