import { useMemo, useState } from 'react';
import { useFlowStore } from '../../core/state/useFlowStore.ts';
import { generate } from '../../core/codegen/generate.ts';
import { useFlowValidation } from '../../hooks/useFlowValidation.ts';

export default function CodePanel() {
  const flow = useFlowStore((s) => s.flow);
  const [copied, setCopied] = useState(false);
  const [importMode, setImportMode] = useState(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const { errorCount, warnCount } = useFlowValidation();

  const code = useMemo(() => {
    try { return generate(flow); }
    catch (e) { return `// Error generating code: ${e.message}`; }
  }, [flow]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `${flow.name || 'flow'}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const runImport = () => {
    setImportError('');
    try {
      const raw = JSON.parse(importText);
      useFlowStore.getState().loadFlow(raw);
      setImportMode(null);
      setImportText('');
    } catch (e) {
      setImportError(e.message);
    }
  };

  const frameworkLabel = flow.target === 'playwright' ? 'Playwright' : 'Cypress';

  return (
    <section className="codepanel">
      <header className="codepanel-head">
        <h3 className="panel-title">{frameworkLabel} code</h3>
        <div className="codepanel-actions">
          <button onClick={copy} className="copy-btn">{copied ? 'Copied!' : 'Copy'}</button>
          <button onClick={exportJson} className="copy-btn">Export JSON</button>
          <button
            onClick={() => { setImportMode((m) => m ? null : 'json'); setImportText(''); setImportError(''); }}
            className={`copy-btn ${importMode ? 'active' : ''}`}
          >
            Import JSON
          </button>
        </div>
      </header>

      {errorCount > 0 && (
        <div className="validation-banner validation-banner-error">
          ⚠ {errorCount} validation error{errorCount !== 1 ? 's' : ''} — fix before running
        </div>
      )}
      {errorCount === 0 && warnCount > 0 && (
        <div className="validation-banner validation-banner-warn">
          ● {warnCount} warning{warnCount !== 1 ? 's' : ''} (e.g. test.only present)
        </div>
      )}

      {importMode && (
        <div className="import-panel">
          <p className="import-hint">Paste a v1 or v2 flow JSON to load it. v1 is auto-migrated.</p>
          <textarea
            className="import-textarea"
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
            placeholder={'{ "version": "2.0", ... }'}
            spellCheck={false}
          />
          {importError && <p className="import-error">{importError}</p>}
          <div className="import-footer">
            <button onClick={runImport} className="copy-btn" disabled={!importText.trim()}>Load</button>
            <button onClick={() => setImportMode(null)} className="copy-btn">Cancel</button>
          </div>
        </div>
      )}

      <pre className="codepanel-pre"><code>{code}</code></pre>
    </section>
  );
}
