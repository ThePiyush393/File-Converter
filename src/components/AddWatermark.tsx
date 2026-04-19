import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileText, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function AddWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ff0000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return { r, g, b };
  };

  const apply = async () => {
    if (!file || !text) return;
    setLoading(true);
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const { r, g, b } = hexToRgb(color);

    doc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height / 2 - fontSize / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: { type: 'degrees', angle: -45 },
      });
    });

    const bytes = await doc.save();
    setResult(new Blob([bytes], { type: 'application/pdf' }));
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => setFile(f)} accept=".pdf" label="Drop PDF to watermark" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <FileText size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">{formatSize(file.size)}</div>
            </div>
            <button className="file-item-remove" onClick={() => setFile(null)}>✕</button>
          </div>
          <div className="controls-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Watermark Text</label>
              <input className="select" value={text} onChange={e => setText(e.target.value)} placeholder="CONFIDENTIAL" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }} />
              </div>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Font Size: {fontSize}px</label>
                <input type="range" className="slider" min={12} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} />
              </div>
            </div>
            <div>
              <div className="control-row">
                <span className="control-label">Opacity</span>
                <span className="control-value">{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" className="slider" min={0.05} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} />
            </div>
          </div>
          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>✓ Watermark Applied!</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Output size: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(result.size)}</strong></p>
              </div>
              <button className="btn btn-success" onClick={() => downloadBlob(result, `watermarked_${file.name}`)}>
                <Download size={16} /> Download ({formatSize(result.size)})
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={apply} disabled={loading || !text}>
              {loading ? <><span className="spinner" /> Applying...</> : 'Add Watermark'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
