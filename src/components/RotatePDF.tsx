import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { FileText, RotateCw, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const load = async (f: File) => {
    setFile(f); setResult(null);
    const ab = await f.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  };

  const rotate = async () => {
    if (!file) return;
    setLoading(true);
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    const indices = pages === 'all'
      ? Array.from({ length: doc.getPageCount() }, (_, i) => i)
      : pages.split(',').flatMap(p => {
          p = p.trim(); const d = p.indexOf('-');
          if (d > -1) return Array.from({ length: parseInt(p.slice(d+1)) - parseInt(p.slice(0,d)) + 1 }, (_, k) => parseInt(p.slice(0,d)) - 1 + k);
          return [parseInt(p) - 1];
        });
    indices.forEach(i => { if (i >= 0 && i < doc.getPageCount()) doc.getPage(i).setRotation(degrees((doc.getPage(i).getRotation().angle + angle) % 360)); });
    const bytes = await doc.save();
    setResult(new Blob([bytes], { type: 'application/pdf' }));
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => load(f)} accept=".pdf" label="Drop PDF to rotate" />
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
            <p className="control-label" style={{ marginBottom: '0.75rem' }}>Rotation Angle</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[90, 180, 270].map(a => (
                <button key={a} className={`btn ${angle === a ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setAngle(a)}>
                  <RotateCw size={14} /> {a}°
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Apply to pages</label>
              <input className="select" placeholder="all  or  1, 2-4, 6" value={pages} onChange={e => setPages(e.target.value)} />
            </div>
          </div>

          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>✓ Rotated {angle}° Successfully</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Output size: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(result.size)}</strong></p>
              </div>
              <button className="btn btn-success" onClick={() => downloadBlob(result, `rotated_${file.name}`)}>
                <Download size={16} /> Download ({formatSize(result.size)})
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={rotate} disabled={loading}>
              {loading ? <><span className="spinner" /> Rotating...</> : `Rotate ${angle}°`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
