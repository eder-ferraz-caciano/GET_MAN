import React, { useState, useEffect } from 'react';
import { Copy, Trash2 } from 'lucide-react';

interface CPFCNPJValidatorProps {
  onBack?: () => void;
}

type DocumentType = 'CPF' | 'CNPJ' | 'unknown';

// CPF validation algorithm
const validateCPF = (cpf: string): boolean => {
  // Remove non-digit characters
  const digits = cpf.replace(/\D/g, '');

  // Must have exactly 11 digits
  if (digits.length !== 11) {
    return false;
  }

  // Reject all same digits (000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verify check digits
  return (
    parseInt(digits[9], 10) === firstDigit &&
    parseInt(digits[10], 10) === secondDigit
  );
};

// CNPJ validation algorithm
const validateCNPJ = (cnpj: string): boolean => {
  // Remove non-digit characters
  const digits = cnpj.replace(/\D/g, '');

  // Must have exactly 14 digits
  if (digits.length !== 14) {
    return false;
  }

  // Reject all same digits (00.000.000/0000-00, 11.111.111/1111-11, etc.)
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  // Calculate first check digit
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * firstMultipliers[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calculate second check digit
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i], 10) * secondMultipliers[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verify check digits
  return (
    parseInt(digits[12], 10) === firstDigit &&
    parseInt(digits[13], 10) === secondDigit
  );
};

// Format CPF: 123.456.789-00
const formatCPF = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// Format CNPJ: 12.345.678/0001-90
const formatCNPJ = (cnpj: string): string => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

// Detect document type
const detectDocType = (input: string): DocumentType => {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11) return 'CPF';
  if (digits.length === 14) return 'CNPJ';
  return 'unknown';
};

export const CPFCNPJValidator: React.FC<CPFCNPJValidatorProps> = () => {
  const [input, setInput] = useState('');
  const [docType, setDocType] = useState<DocumentType>('unknown');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    if (!input.trim()) {
      setDocType('unknown');
      setIsValid(null);
      setError(null);
      setFormattedValue('');
      return;
    }

    const detectedType = detectDocType(input);
    setDocType(detectedType);

    if (detectedType === 'unknown') {
      setError('Digite um CPF (11 dígitos) ou CNPJ (14 dígitos)');
      setIsValid(null);
      setFormattedValue('');
      return;
    }

    setError(null);

    try {
      if (detectedType === 'CPF') {
        const valid = validateCPF(input);
        setIsValid(valid);
        setFormattedValue(formatCPF(input));
      } else if (detectedType === 'CNPJ') {
        const valid = validateCNPJ(input);
        setIsValid(valid);
        setFormattedValue(formatCNPJ(input));
      }
    } catch {
      setError('Erro ao validar documento');
      setIsValid(null);
      setFormattedValue('');
    }
  }, [input]);

  const handleCopy = async () => {
    if (!formattedValue) return;

    try {
      await navigator.clipboard.writeText(formattedValue);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Silently fail on copy error
    }
  };

  const handleClear = () => {
    setInput('');
    setDocType('unknown');
    setIsValid(null);
    setError(null);
    setFormattedValue('');
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
          Documento
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite CPF ou CNPJ aqui"
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: '500',
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

      {/* Validation Result */}
      {!error && isValid !== null && (
        <div
          style={{
            padding: '16px',
            backgroundColor: isValid
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isValid ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Status Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: isValid
                  ? 'rgb(34, 197, 94)'
                  : 'rgb(239, 68, 68)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {isValid ? '✓' : '✕'}
            </div>
            <div>
              <div
                style={{
                  color: isValid ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                {isValid ? 'Válido' : 'Inválido'}
              </div>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  marginTop: '2px',
                }}
              >
                Tipo: {docType}
              </div>
            </div>
          </div>

          {/* Formatted Value */}
          {isValid && formattedValue && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Formato
              </label>
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: '600',
                  wordBreak: 'break-all',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{formattedValue}</span>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    backgroundColor: copySuccess
                      ? 'rgb(34, 197, 94)'
                      : 'transparent',
                    border: copySuccess
                      ? '1px solid rgb(34, 197, 94)'
                      : '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: copySuccess
                      ? 'white'
                      : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    marginLeft: '8px',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!copySuccess) {
                      e.currentTarget.style.backgroundColor =
                        'var(--accent-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!copySuccess) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                  }}
                  title={copySuccess ? 'Copiado!' : 'Copiar valor formatado'}
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!error && isValid === null && !input && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Digite um CPF ou CNPJ para validar
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
            title="Limpar entrada"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};
