# Fase 3b — Dev Tools de Rede Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 network utility tools (IP Info, DNS Lookup, Ping) to DevTools panel for network diagnostics and troubleshooting.

**Architecture:** Three independent components that integrate into existing DevToolsPanel. Tools make HTTP requests to public APIs (ip-api.com, Cloudflare DNS-over-HTTPS). Ping tool uses Tauri shell command (ICMP) with graceful browser fallback. No new dependencies required except `@tauri-apps/api` (already available).

**Tech Stack:** React 19, TypeScript 5.9, Tauri 2 (for ping), HTTP fetch API, CSS variables from existing theme

---

## File Structure

```
src/components/devtools/
├── DevToolsPanel.tsx          (MODIFY — add 3 new tools to tools array)
└── tools/
    ├── IpInfoTool.tsx         (CREATE — IP geolocation)
    ├── DnsLookupTool.tsx      (CREATE — DNS resolution)
    └── PingTool.tsx           (CREATE — ICMP ping simulation/HTTP)

src/App.css                     (MODIFY — add CSS classes for network tools)
```

**Changes Summary:**
- 3 new tool components (~250-300 lines each)
- DevToolsPanel.tsx: +3 import statements, +3 tool definitions in tools array
- App.css: +10-15 CSS classes for network tool UI

---

## Task Breakdown

### Task 1: Create IpInfoTool.tsx

**Files:**
- Create: `src/components/devtools/tools/IpInfoTool.tsx`
- Modify: `src/components/devtools/DevToolsPanel.tsx` (add import + tools entry)

**Component Spec:**
- Displays user's public IP and geolocation info
- Calls `https://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,isp,org,as,mobile,proxy,hosting,query`
- Shows: IP, Country, City, Region, ISP, Timezone, Latitude, Longitude
- Auto-fetch on mount
- Refresh button
- Copy IP button
- Error handling for API failures
- Loading state (spinner or placeholder)
- Portuguese UI labels
- Optional: Map link (open in Google Maps)

**Implementation:**
- Use fetch with no-cors mode (ip-api.com allows CORS)
- State: `ip`, `location`, `error`, `loading`
- Display as grid of info cards
- Use existing CSS variables
- Portuguese: "Informações do IP", "Meu IP", "País", "Cidade", "ISP", "Timezone", etc.

- [ ] **Step 1: Create IpInfoTool.tsx with fetch logic**

```typescript
import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';

interface IpInfoData {
  query: string;
  city: string;
  region: string;
  regionName: string;
  country: string;
  countryCode: string;
  timezone: string;
  isp: string;
  org: string;
  lat: number;
  lon: number;
  status: string;
}

interface IpInfoToolProps {
  onBack?: () => void;
}

export const IpInfoTool: React.FC<IpInfoToolProps> = ({ onBack }) => {
  const [data, setData] = useState<IpInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchIpInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,isp,org,as,mobile,proxy,hosting,query'
      );
      if (!response.ok) throw new Error('Falha ao buscar informações');
      const result = await response.json();
      if (result.status === 'fail') throw new Error(result.message);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const handleCopy = () => {
    if (data?.query) {
      navigator.clipboard.writeText(data.query).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <button onClick={onBack} className="tool-button" style={{ marginRight: 'auto' }}>
          ← Voltar
        </button>
        <button onClick={fetchIpInfo} className="tool-button" disabled={loading}>
          <RotateCw size={16} /> Atualizar
        </button>
      </div>

      <div className="tool-content">
        {loading && <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>}

        {error && <p style={{ color: 'var(--error-color)' }}>Erro: {error}</p>}

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Meu IP</label>
              <p style={{ fontWeight: 'bold', fontFamily: 'monospace', margin: '0.5rem 0 0' }}>{data.query}</p>
              <button onClick={handleCopy} className="tool-button" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                {copySuccess ? '✓ Copiado' : <Copy size={14} />}
              </button>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>País</label>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0' }}>{data.country} ({data.countryCode})</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cidade</label>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0' }}>{data.city || '-'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Região</label>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0' }}>{data.regionName || '-'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ISP</label>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>{data.isp}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Timezone</label>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0' }}>{data.timezone}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latitude</label>
              <p style={{ fontWeight: 'bold', fontFamily: 'monospace', margin: '0.5rem 0 0' }}>{data.lat.toFixed(4)}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Longitude</label>
              <p style={{ fontWeight: 'bold', fontFamily: 'monospace', margin: '0.5rem 0 0' }}>{data.lon.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add IpInfoTool to DevToolsPanel.tsx tools array**

In `src/components/devtools/DevToolsPanel.tsx`, add:
```typescript
import { IpInfoTool } from './tools/IpInfoTool';

// In tools array, add:
{
  id: 'ipinfo',
  component: IpInfoTool,
  icon: Globe,
  label: 'Informações do IP',
  description: 'IP público e geolocalização'
}
```

- [ ] **Step 3: Verify component builds and renders**

Run: `npm run build`
Expected: No errors, component tree shows IpInfoTool in devtools

---

### Task 2: Create DnsLookupTool.tsx

**Files:**
- Create: `src/components/devtools/tools/DnsLookupTool.tsx`
- Modify: `src/components/devtools/DevToolsPanel.tsx` (add import + tools entry)

**Component Spec:**
- DNS lookup using Cloudflare DNS-over-HTTPS API
- Input: domain name
- Output: A records (IPv4), AAAA records (IPv6), MX records, NS records, TXT records
- Shows different record types in tabs or sections
- Auto-lookup on Enter key
- Lookup button
- Copy result button per record
- Error handling (domain not found, invalid domain, API errors)
- Portuguese UI

**Implementation:**
- Cloudflare DoH endpoint: `https://cloudflare-dns.com/dns-query?name={domain}&type=A`
- Separate calls for A, AAAA, MX, NS, TXT record types
- State: `domain`, `results`, `loading`, `error`, `selectedType`
- Display results as list of records with copy buttons
- Uses `application/json` Accept header

- [ ] **Step 1: Create DnsLookupTool.tsx with DNS lookup logic**

```typescript
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
```

- [ ] **Step 2: Add DnsLookupTool to DevToolsPanel.tsx tools array**

In `src/components/devtools/DevToolsPanel.tsx`, add:
```typescript
import { DnsLookupTool } from './tools/DnsLookupTool';

// In tools array, add:
{
  id: 'dnslookuP',
  component: DnsLookupTool,
  icon: Globe,
  label: 'Lookup DNS',
  description: 'Resolver nomes de domínio'
}
```

- [ ] **Step 3: Verify component builds and renders**

Run: `npm run build`
Expected: No errors

---

### Task 3: Create PingTool.tsx

**Files:**
- Create: `src/components/devtools/tools/PingTool.tsx`
- Modify: `src/components/devtools/DevToolsPanel.tsx` (add import + tools entry)

**Component Spec:**
- Browser: Simulate ping using HTTP HEAD request (measures latency)
- Tauri: Use native `ping` command via shell (ICMP)
- Input: hostname or IP
- Output: Response time (ms), success/failure
- Run multiple pings (1, 5, or 10)
- Show: min/avg/max latency
- Error handling: host unreachable, timeout, etc.
- Portuguese UI

**Implementation:**
- Use isTauri() guard to choose browser vs Tauri implementation
- Browser: fetch HEAD to target (will fail for non-CORS, so use fallback to HTTP GET or use timing API)
- Tauri: import { Command } from '@tauri-apps/api/shell' and run `ping` command
- State: `host`, `results`, `loading`, `error`, `count`
- Display results as list with average/min/max

- [ ] **Step 1: Create PingTool.tsx with browser + Tauri implementations**

```typescript
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
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://${hostname}`, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors'
        });

        clearTimeout(timeoutId);
        const time = performance.now() - start;
        results.push({ time: Math.round(time), success: true });
      } catch (err) {
        clearTimeout(timeoutId);
        results.push({
          time: 0,
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    }

    return results;
  };

  const pingTauri = async (hostname: string, pings: number): Promise<PingResult[]> => {
    try {
      const { Command } = await import('@tauri-apps/api/shell');
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
```

- [ ] **Step 2: Add PingTool to DevToolsPanel.tsx tools array**

In `src/components/devtools/DevToolsPanel.tsx`, add:
```typescript
import { PingTool } from './tools/PingTool';

// In tools array, add:
{
  id: 'ping',
  component: PingTool,
  icon: Activity,
  label: 'Ping',
  description: 'Testar latência de conexão'
}
```

- [ ] **Step 3: Verify component builds and renders**

Run: `npm run build`
Expected: No errors

---

### Task 4: Update CSS in App.css

**Files:**
- Modify: `src/App.css` (add network tool specific styles)

**Changes:**
- Add classes for network tool result grids
- Add classes for DNS record lists
- Add classes for ping stats display
- All using existing CSS variables

- [ ] **Step 1: Add network tool CSS classes**

Append to `src/App.css`:

```css
/* Network Tools Styles */

.network-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.network-info-card {
  padding: 1rem;
  background-color: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.network-info-card label {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.5rem;
}

.network-info-card p {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.dns-record-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dns-record-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.dns-record-item button {
  flex-shrink: 0;
}

.ping-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.ping-stat-item {
  padding: 1rem;
  background-color: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-align: center;
}

.ping-stat-item label {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.25rem;
}

.ping-stat-item p {
  margin: 0;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.ping-result-success {
  background-color: rgba(34, 197, 94, 0.1);
  border-left: 3px solid rgb(34, 197, 94);
}

.ping-result-failure {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 3px solid rgb(239, 68, 68);
}
```

- [ ] **Step 2: Verify CSS compiles and no conflicts**

Run: `npm run build`
Expected: No CSS errors, existing styles unchanged

---

### Task 5: Run Cypress Tests

**Files:**
- Test: All existing tests (121 Cypress tests should still pass)

**Requirements:**
- All 121 existing tests pass
- No new tests required for Phase 3b (network tools are not core functionality)
- Network tools render without breaking existing UI

- [ ] **Step 1: Run full Cypress test suite**

Run: `npm run cypress:run`
Expected: All 121 tests pass, exit code 0

- [ ] **Step 2: Verify new tools integrate without breaking HTTP client**

Visually check:
- DevToolsPanel shows 12 tools total (9 from Phase 3a + 3 from Phase 3b)
- Switching between tools works
- HTTP Client tab still works normally
- Dev Tools tab shows all tools

---

## Summary

**Total Tasks:** 5
**Files Created:** 3 tool components (~250-300 lines each)
**Files Modified:** 2 (DevToolsPanel.tsx, App.css)
**Test Coverage:** Existing 121 tests still pass

**Next Steps After Implementation:**
- All 3 network tools will be integrated into DevToolsPanel
- Users can access IP info, DNS lookup, and ping via Dev Tools tab
- No breaking changes to HTTP client functionality
- All work without automatic commits (user controls deployment)
