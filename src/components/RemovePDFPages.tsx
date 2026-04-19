import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function RemovePDFPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [toRemove, setToRemove] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const load = async (f: File) => {
    setFile(f); setResult(null); setError('');
    const ab = await f.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  };

  const remove = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const ab = await file.arrayBuffer();
      const src = await PDFDocument.load(ab, { ignoreEncryption: true });
      // Parse pages to remove (1-indexed, comma & range)
      const removeSet = new Set<number>();
      toRemove.split(',').forEach(part => {
        part = part.trim();
        const dash = part.indexOf('-');
        if (dash > -1) {
          for (let i = parseInt(part.slice(0, dash)); i <= parseInt(part.slice(dash+1)); i++) removeSet.add(i-1);
        } else { removeSet.add(parseInt(part) - 1); }
      });

      const keepIndices = Array.from({ length: src.getPageCount() }, (_, i) => i).filter(i => !removeSet.has(i));
      if (keepIndices.length === 0) throw new Error('Cannot remove all pages!');

      const dst = await PDFDocument.create();
      const pages = await dst.copyPages(src, keepIndices);
      pages.forEach(p => dst.addPage(p));
      const bytes = await dst.save();
      setResult(new Blob([bytes], { type: 'application/pdf' }));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => load(f)} accept=".pdf" label="Drop your PDF here" sublabel="Select pages to remove after loading" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <FileText size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">{formatSize(file.size)} • {pageCount} pages</div>
            </div>
            <button className="file-item-remove" onClick={() => setFile(null)}>✕</button>
          </div>

          <div className="controls-panel">
            <label className="control-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Pages to remove (e.g. 1, 3, 5-8)
            </label>
            <input className="select" placeholder={`1 to ${pageCount}`} value={toRemove} onChange={e => setToRemove(e.target.value)} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Use commas and dashes: 1, 3-5, 8</p>
          </div>

          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</p>}

          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>✓ Pages Removed Successfully</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Original: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(file.size)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Result: <strong style={{ color: 'var(--accent-green)' }}>{formatSize(result.size)}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => downloadBlob(result, `trimmed_${file.name}`)}>
                  <Download size={16} /> Download ({formatSize(result.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Remove More</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={remove} disabled={loading || !toRemove.trim()}>
              {loading ? <><span className="spinner" /> Processing...</> : 'Remove Pages'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
