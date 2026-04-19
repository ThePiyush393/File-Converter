import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ImageIcon, GripVertical, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function ImageToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'A4' | 'Letter'>('fit');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const addFiles = (f: File[]) => setFiles(prev => [...prev, ...f.filter(x => x.type.startsWith('image/'))]);
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));
  const moveUp = (i: number) => { if (!i) return; const a = [...files]; [a[i-1],a[i]]=[a[i],a[i-1]]; setFiles(a); };

  const convert = async () => {
    if (!files.length) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const ab = await file.arrayBuffer();
        let img;
        if (file.type === 'image/png') img = await pdfDoc.embedPng(ab);
        else img = await pdfDoc.embedJpg(ab);

        let pw = img.width, ph = img.height;
        if (pageSize === 'A4') { pw = 595.28; ph = 841.89; }
        else if (pageSize === 'Letter') { pw = 612; ph = 792; }

        const page = pdfDoc.addPage([pw, ph]);
        const scale = Math.min(pw / img.width, ph / img.height);
        const w = img.width * scale, h = img.height * scale;
        page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      const bytes = await pdfDoc.save();
      setResult(new Blob([bytes], { type: 'application/pdf' }));
    } catch (e: any) { setError(e.message || 'Conversion failed'); }
    setLoading(false);
  };

  return (
    <div>
      <DropZone onFiles={addFiles} accept="image/*" multiple label="Drop images to convert to PDF" sublabel="JPG, PNG, WEBP supported — reorder below" />

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.72rem', background: 'var(--bg-tertiary)', borderRadius: '4px', padding: '1px 6px', color: 'var(--accent-primary)', fontWeight: 700 }}>{i+1}</span>
                <ImageIcon size={18} className="file-item-icon" />
                <div className="file-item-info">
                  <div className="file-item-name">{f.name}</div>
                  <div className="file-item-size">{formatSize(f.size)}</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => moveUp(i)} disabled={i===0}>↑</button>
                <button className="file-item-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="controls-panel">
            <label className="control-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Page Size</label>
            <select className="select" value={pageSize} onChange={e => setPageSize(e.target.value as any)}>
              <option value="fit">Fit to Image</option>
              <option value="A4">A4 (595 × 842 pt)</option>
              <option value="Letter">Letter (612 × 792 pt)</option>
            </select>
          </div>

          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</p>}

          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>✓ PDF Created! ({files.length} page{files.length > 1 ? 's' : ''})</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Output size: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(result.size)}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => downloadBlob(result, 'images.pdf')}>
                  <Download size={16} /> Download PDF ({formatSize(result.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Convert More</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={convert} disabled={loading}>
              {loading ? <><span className="spinner" /> Converting...</> : `Convert ${files.length} Image${files.length>1?'s':''} to PDF`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
