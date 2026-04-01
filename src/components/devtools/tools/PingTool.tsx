import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface PingResult {
  time: number;
  success: boolean;
  error?: string;
}

interface PingToolProps {
  onBack?: () => void;
}

const isTauri = () => typeof window !== 'undefined' && !!(window as any).__TAURI__;

export const PingTool: React.FC<PingToolProps> = ({ onBack }) => {
  const [host, setHost] = useState('');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<PingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pingBrowser = async (hostname: string, pings: number): Promise<PingResult[]> => {
    const results: PingResult[] = [];

    for (let i = 0; i < pings; i++) {
      const start = performance.now();
      let timeoutId: NodeJS.Timeout | null = null;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(`https://${hostname}`, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors'
        });

        if (timeoutId) clearTimeout(timeoutId);
        const time = performance.now() - start;
        results.push({ time: Math.round(time), success: true });
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        results.push({
          time: 0,
          success: false,
          error: err instanceof Error ? err.message : 'Timeout'
        });
      }
    }

    return results;
  };

  const pingTauri = async (hostname: string, pings: number): Promise<PingResult[]> => {
    // Dynamic import to prevent Vite from failing the build on web
    // This only executes at runtime when on Tauri
    try {
      // Concatenate string to prevent Vite static analysis
      const mod = '@tauri-apps' + '/api/' + 'shell';
      const shellModule = await import(mod);

      if (!shellModule || !shellModule.Command) {
        throw new Error('Tauri não disponível');
      }

      const { Command } = shellModule;
      const results: PingResult[] = [];

      for (let i = 0; i < pings; i++) {
        try {
          const start = performance.now();
          const output = await Command.sidecar('ping', ['-c', '1', '-W', '5', hostname]).execute();
          const time = performance.now() - start;

          if (output.code === 0) {
            results.push({ time: Math.round(time), success: true });
          } else {
            results.push({ time: 0, success: false, error: 'Host unreachable' });
          }
        } catch (err) {
          results.push({
            time: 0,
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido'
          });
        }
      }

      return results;
    } catch {
      throw new Error('Tauri não disponível');
    }
  };

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) {
      setError('Digite um hostname ou IP');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const pingResults = isTauri()
        ? await pingTauri(host, count)
        : await pingBrowser(host, count);

      setResults(pingResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const times = results.filter((r) => r.success).map((r) => r.time);
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <button onClick={onBack} className="tool-button" style={{ marginRight: 'auto' }}>
          ← Voltar
        </button>
      </div>

      <div className="tool-content">
        <form onSubmit={handlePing} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="google.com"
              className="tool-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="tool-button" disabled={loading}>
              {loading ? 'Pingando...' : <Activity size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Pings:
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="tool-select"
                style={{ marginLeft: '0.5rem' }}
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
          </div>
        </form>

        {error && <p style={{ color: 'var(--error-color)' }}>Erro: {error}</p>}

        {results.length > 0 && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sucesso</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {successCount}/{results.length}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Min</p>
                <p style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{minTime}ms</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Médio</p>
                <p style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{avgTime}ms</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Máx</p>
                <p style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{maxTime}ms</p>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Resultados</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {results.map((result, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${result.success ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`,
                      borderRadius: '4px',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      {result.success ? `✓ ${result.time}ms` : `✗ ${result.error}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
