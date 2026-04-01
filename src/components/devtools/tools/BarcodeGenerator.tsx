import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, AlertCircle } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface BarcodeGeneratorProps {
  onBack?: () => void;
}

type BarcodeFormat = 'CODE128' | 'EAN13' | 'CODE39' | 'EAN8' | 'UPCA';

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = () => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const validateInput = (input: string, selectedFormat: BarcodeFormat): boolean => {
    if (!input.trim()) {
      setError('Por favor, insira um texto para gerar o código de barras');
      return false;
    }

    // Format-specific validation
    switch (selectedFormat) {
      case 'EAN13':
        if (!/^\d+$/.test(input)) {
          setError('EAN13 requer apenas dígitos');
          return false;
        }
        if (input.length !== 13) {
          setError('EAN13 requer exatamente 13 dígitos');
          return false;
        }
        break;

      case 'EAN8':
        if (!/^\d+$/.test(input)) {
          setError('EAN8 requer apenas dígitos');
          return false;
        }
        if (input.length !== 8) {
          setError('EAN8 requer exatamente 8 dígitos');
          return false;
        }
        break;

      case 'UPCA':
        if (!/^\d+$/.test(input)) {
          setError('UPC-A requer apenas dígitos');
          return false;
        }
        if (input.length !== 12) {
          setError('UPC-A requer exatamente 12 dígitos');
          return false;
        }
        break;

      case 'CODE39':
        if (!/^[A-Z0-9\-. ]*$/.test(input)) {
          setError('CODE39 permite apenas letras maiúsculas, números, hífens, pontos e espaços');
          return false;
        }
        break;

      case 'CODE128':
        // CODE128 supports most characters, just check it's not too long
        if (input.length > 100) {
          setError('Texto muito longo para gerar código de barras');
          return false;
        }
        break;
    }

    return true;
  };

  useEffect(() => {
    if (!text.trim()) {
      setError(null);
      return;
    }

    setError(null);
    setCopySuccess(false);

    if (!validateInput(text, format)) {
      return;
    }

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, text, {
          format: format,
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao gerar código de barras: ${err.message}`
          : 'Erro desconhecido ao gerar código de barras'
      );
    }
  }, [text, format]);

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${format}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleCopySVG = async () => {
    if (!svgRef.current) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      await navigator.clipboard.writeText(svgData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Erro ao copiar para a área de transferência');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}
        >
          Texto
        </label>
        <input
          className="tool-input"
          type="text"
          placeholder="Insira o texto para gerar código de barras"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '13px',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}
        >
          Formato
        </label>
        <select
          className="tool-select"
          value={format}
          onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN-13</option>
          <option value="CODE39">CODE39</option>
          <option value="EAN8">EAN-8</option>
          <option value="UPCA">UPC-A</option>
        </select>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgb(239, 68, 68)',
            borderRadius: '4px',
            color: 'rgb(239, 68, 68)',
            fontSize: '13px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {text.trim() && !error && (
        <div className="tool-output" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            <svg ref={svgRef} />
          </div>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Formato: {format} | Tamanho: {text.length} caracteres
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
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
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Download size={16} />
              Baixar PNG
            </button>

            <button
              onClick={handleCopySVG}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: copySuccess ? 'rgb(34, 197, 94)' : 'var(--bg-panel)',
                border: `1px solid ${copySuccess ? 'rgb(34, 197, 94)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                color: copySuccess ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
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
            >
              <Copy size={16} />
              {copySuccess ? 'Copiado!' : 'Copiar SVG'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
