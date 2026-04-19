import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, Plus, GripVertical, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const addFiles = (newFiles: File[]) => setFiles(prev => [...prev, ...newFiles]);
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));
  const moveUp = (i: number) => { if (i === 0) return; const a = [...files]; [a[i-1], a[i]] = [a[i], a[i-1]]; setFiles(a); };

  const merge = async () => {
    if (files.length < 2) { setError('Add at least 2 PDF files.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const ab = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      setResult(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    } catch (e: any) { setError(e.message || 'Merge failed'); }
    setLoading(false);
  };

  return (
    <div>
      <DropZone onFiles={addFiles} accept=".pdf,application/pdf" multiple label="Drop PDF files to merge" sublabel="Add multiple files — you can reorder them below" />

      {files.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-item" style={{ cursor: 'grab' }}>
                <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', padding: '1px 7px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{i+1}</span>
                <FileText size={18} className="file-item-icon" />
                <div className="file-item-info">
                  <div className="file-item-name">{f.name}</div>
                  <div className="file-item-size">{formatSize(f.size)}</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => moveUp(i)} disabled={i===0}>↑</button>
                <button className="file-item-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="result-actions" style={{ marginTop: '1rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => document.getElementById('merge-add')?.click()}>
              <Plus size={14} /> Add More
            </button>
            <input id="merge-add" type="file" accept=".pdf" multiple hidden onChange={e => addFiles(Array.from(e.target.files ?? []))} />
          </div>

          {error && <p style={{ color: 'var(--accent-red)', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}

          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--accent-green)', fontSize: '1.75rem' }}>✓</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.3rem' }}>Merged PDF Ready!</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {files.length} files combined • Output size: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(result.size)}</strong>
                  </p>
                </div>
              </div>
              <button className="btn btn-success" onClick={() => downloadBlob(result, 'merged.pdf')}>
                <Download size={16} /> Download Merged PDF ({formatSize(result.size)})
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }} onClick={merge} disabled={loading || files.length < 2}>
              {loading ? <><span className="spinner" /> Merging...</> : `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
