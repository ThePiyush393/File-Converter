import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FileText } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function AddPageNumber() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center'>('bottom-center');
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const apply = async () => {
    if (!file) return;
    setLoading(true);
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    doc.getPages().forEach((page, idx) => {
      const { width, height } = page.getSize();
      const label = String(startFrom + idx);
      const tw = font.widthOfTextAtSize(label, fontSize);
      let x = width / 2 - tw / 2;
      let y = 20;
      if (position === 'bottom-right') { x = width - tw - 20; }
      if (position === 'top-center') { y = height - 30; }
      page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    });
    const bytes = await doc.save();
    setResult(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => setFile(f)} accept=".pdf" label="Drop PDF to add page numbers" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <FileText size={20} className="file-item-icon" />
            <div className="file-item-info"><div className="file-item-name">{file.name}</div><div className="file-item-size">{formatSize(file.size)}</div></div>
            <button className="file-item-remove" onClick={() => setFile(null)}>✕</button>
          </div>
          <div className="controls-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Position</label>
              <select className="select" value={position} onChange={e => setPosition(e.target.value as any)}>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-center">Top Center</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Start From</label>
                <input type="number" className="select" min={1} value={startFrom} onChange={e => setStartFrom(+e.target.value)} />
              </div>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Font Size</label>
                <input type="number" className="select" min={6} max={24} value={fontSize} onChange={e => setFontSize(+e.target.value)} />
              </div>
            </div>
          </div>
          {result ? (
            <div className="result-panel">
              <span>✓</span>
              <div style={{ flex: 1 }}><h4 style={{ color: 'var(--accent-green)' }}>Page numbers added!</h4></div>
              <button className="btn btn-success btn-sm" onClick={() => downloadBlob(result, `numbered_${file.name}`)}>⬇ Download</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={apply} disabled={loading}>
              {loading ? <><span className="spinner" /> Applying...</> : 'Add Page Numbers'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
