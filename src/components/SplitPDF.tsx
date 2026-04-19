import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<'all' | 'range' | 'every'>('all');
  const [rangeInput, setRangeInput] = useState('');
  const [everyN, setEveryN] = useState(1);
  const [loading, setLoading] = useState(false);
  const [blobs, setBlobs] = useState<{ name: string; blob: Blob }[]>([]);
  const [error, setError] = useState('');

  const load = async (f: File) => {
    setFile(f); setBlobs([]); setError('');
    const ab = await f.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  };

  const parseRanges = (input: string, max: number): number[][] => {
    const parts = input.split(',').map(s => s.trim());
    return parts.map(p => {
      const dash = p.indexOf('-');
      if (dash > -1) {
        const s = Math.max(1, parseInt(p.slice(0, dash))) - 1;
        const e = Math.min(max, parseInt(p.slice(dash + 1))) - 1;
        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
      }
      return [parseInt(p) - 1];
    });
  };

  const split = async () => {
    if (!file) return;
    setLoading(true); setError(''); setBlobs([]);
    try {
      const ab = await file.arrayBuffer();
      const src = await PDFDocument.load(ab, { ignoreEncryption: true });
      const results: { name: string; blob: Blob }[] = [];

      if (mode === 'all') {
        for (let i = 0; i < src.getPageCount(); i++) {
          const doc = await PDFDocument.create();
          const [page] = await doc.copyPages(src, [i]);
          doc.addPage(page);
          const bytes = await doc.save();
          results.push({ name: `page_${i+1}.pdf`, blob: new Blob([bytes], { type: 'application/pdf' }) });
        }
      } else if (mode === 'range') {
        const groups = parseRanges(rangeInput, src.getPageCount());
        for (let g = 0; g < groups.length; g++) {
          const doc = await PDFDocument.create();
          const pages = await doc.copyPages(src, groups[g]);
          pages.forEach(p => doc.addPage(p));
          const bytes = await doc.save();
          results.push({ name: `split_${g+1}.pdf`, blob: new Blob([bytes], { type: 'application/pdf' }) });
        }
      } else {
        let i = 0;
        while (i < src.getPageCount()) {
          const indices = Array.from({ length: Math.min(everyN, src.getPageCount() - i) }, (_, k) => i + k);
          const doc = await PDFDocument.create();
          const pages = await doc.copyPages(src, indices);
          pages.forEach(p => doc.addPage(p));
          const bytes = await doc.save();
          results.push({ name: `part_${results.length+1}.pdf`, blob: new Blob([bytes], { type: 'application/pdf' }) });
          i += everyN;
        }
      }

      setBlobs(results);
    } catch (e: any) { setError(e.message || 'Split failed'); }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => load(f)} accept=".pdf,application/pdf" label="Drop your PDF to split" sublabel="We'll process it entirely offline" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <FileText size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">{formatSize(file.size)} • {pageCount} pages</div>
            </div>
            <button className="file-item-remove" onClick={() => { setFile(null); setBlobs([]); }}>✕</button>
          </div>

          <div className="controls-panel">
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Split Mode</p>
            {(['all', 'range', 'every'] as const).map(m => (
              <label key={m} className="checkbox-row" style={{ cursor: 'pointer' }}>
                <input type="radio" name="split-mode" checked={mode === m} onChange={() => setMode(m)} style={{ accentColor: 'var(--accent-primary)' }} />
                <span>
                  {m === 'all' && 'Extract all pages individually'}
                  {m === 'range' && 'Custom page ranges (e.g. 1-3, 5, 7-9)'}
                  {m === 'every' && `Split every N pages`}
                </span>
              </label>
            ))}
            {mode === 'range' && (
              <input className="select" style={{ marginTop: '0.75rem' }} placeholder="e.g. 1-3, 4-6, 7" value={rangeInput} onChange={e => setRangeInput(e.target.value)} />
            )}
            {mode === 'every' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem' }}>Pages per part:</label>
                <input type="number" className="select" style={{ width: '80px' }} min={1} max={pageCount} value={everyN} onChange={e => setEveryN(+e.target.value)} />
              </div>
            )}
          </div>

          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</p>}

          {blobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-green)', fontWeight: 600 }}>✓ {blobs.length} parts created</p>
              {blobs.map((b, i) => (
                <div key={i} className="file-item">
                  <FileText size={18} className="file-item-icon" />
                  <div className="file-item-info">
                    <div className="file-item-name">{b.name}</div>
                    <div className="file-item-size">{formatSize(b.blob.size)}</div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => downloadBlob(b.blob, b.name)}>⬇</button>
                </div>
              ))}
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={split} disabled={loading}>
              {loading ? <><span className="spinner" /> Splitting...</> : 'Split PDF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
