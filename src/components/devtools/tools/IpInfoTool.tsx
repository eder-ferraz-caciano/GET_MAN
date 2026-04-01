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
