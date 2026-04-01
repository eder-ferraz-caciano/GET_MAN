import React, { useState } from 'react';
import { Download, Copy, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  onBack?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateQR = async () => {
    setError(null);
    setCopySuccess(false);

    if (!text.trim()) {
      setError('Por favor, insira um texto para gerar o QR code');
      setQrUrl(null);
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1,
      });
      setQrUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao gerar QR code: ${err.message}`
          : 'Erro desconhecido ao gerar QR code'
      );
      setQrUrl(null);
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyBase64 = async () => {
    if (!qrUrl) return;

    try {
      await navigator.clipboard.writeText(qrUrl);
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
        <textarea
          className="tool-textarea"
          placeholder="Insira o texto para gerar QR code"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              handleGenerateQR();
            }
          }}
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '13px',
            minHeight: '80px',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Ctrl+Enter para gerar
        </div>
      </div>

      <button
        className="tool-button"
        onClick={handleGenerateQR}
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
        Gerar QR Code
      </button>

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

      {qrUrl && (
        <div className="tool-output" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
          >
            <img
              src={qrUrl}
              alt="QR Code gerado"
              style={{
                maxWidth: '300px',
                height: 'auto',
                borderRadius: '4px',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Tamanho: {text.length} caracteres
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
              onClick={handleCopyBase64}
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
              {copySuccess ? 'Copiado!' : 'Copiar Base64'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
