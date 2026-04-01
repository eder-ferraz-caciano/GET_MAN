import { useState } from 'react';
import { Terminal, Copy, Trash2 } from 'lucide-react';
import type { RequestModel } from '../../types';

interface CodeSnippetProps {
  isOpen: boolean;
  onClose: () => void;
  activeReq: RequestModel | null;
  activeNodeId: string | null;
  getActiveEnvironment: (nodeId: string) => any;
  generateCodeSnippet: (req: RequestModel, lang: string) => string;
  onSnippetCopied: (message: string) => void;
}

export function CodeSnippet({
  isOpen,
  onClose,
  activeReq,
  activeNodeId,
  getActiveEnvironment,
  generateCodeSnippet,
  onSnippetCopied,
}: CodeSnippetProps) {
  const [codeSnippetLang, setCodeSnippetLang] = useState('curl');

  if (!isOpen || !activeReq) return null;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(generateCodeSnippet(activeReq, codeSnippetLang));
    onSnippetCopied('Snippet copiado!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ width: '700px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} className="text-accent" /> Code Snippet Generator
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="select-input"
                value={codeSnippetLang}
                onChange={e => setCodeSnippetLang(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="curl">cURL</option>
                <option value="fetch">Fetch API</option>
                <option value="axios">Axios (JS)</option>
              </select>
              <button className="btn btn-secondary" onClick={handleCopySnippet}>
                <Copy size={14} /> Copiar
              </button>
              <button className="btn-icon" onClick={onClose}><Trash2 size={16} /></button>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Snippet gerado com variáveis resolvidas para o ambiente <b>{activeNodeId ? (getActiveEnvironment(activeNodeId)?.name || 'Global') : 'Global'}</b>.
          </p>
        </div>
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', maxHeight: '400px', overflow: 'auto' }}>
          <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {generateCodeSnippet(activeReq, codeSnippetLang)}
          </pre>
        </div>
      </div>
    </div>
  );
}
