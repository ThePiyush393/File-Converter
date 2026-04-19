import { useState, useRef, useCallback } from 'react';
import { ImageIcon, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob, canvasToBlob, stripExt } from '../utils';

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const load = useCallback((f: File) => {
    setFile(f); setResult(null);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth); setOrigH(img.naturalHeight);
      setW(img.naturalWidth); setH(img.naturalHeight);
    };
    img.src = URL.createObjectURL(f);
  }, []);

  const changeW = (v: number) => {
    setW(v);
    if (lock && origW) setH(Math.round(v * origH / origW));
  };
  const changeH = (v: number) => {
    setH(v);
    if (lock && origH) setW(Math.round(v * origW / origH));
  };

  const resize = async () => {
    if (!file || !imgRef.current) return;
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h); }
    ctx.drawImage(imgRef.current, 0, 0, w, h);
    const blob = await canvasToBlob(canvas, format, quality);
    setResult(blob);
    setLoading(false);
  };

  const ext = format === 'image/jpeg' ? 'jpg' : 'png';

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => load(f)} accept="image/*" label="Drop image to resize" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <ImageIcon size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">{formatSize(file.size)} • {origW}×{origH}px</div>
            </div>
            <button className="file-item-remove" onClick={() => setFile(null)}>✕</button>
          </div>

          {/* Hidden img to draw on canvas */}
          <img ref={imgRef} src={URL.createObjectURL(file)} alt="" style={{ display: 'none' }} />

          <div className="controls-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Width (px)</label>
                <input type="number" className="select" value={w} min={1} onChange={e => changeW(+e.target.value)} />
              </div>
              <button className="btn btn-secondary btn-sm" title="Lock aspect ratio" onClick={() => setLock(!lock)} style={{ marginBottom: '2px' }}>
                {lock ? '🔒' : '🔓'}
              </button>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Height (px)</label>
                <input type="number" className="select" value={h} min={1} onChange={e => changeH(+e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Output Format</label>
                <select className="select" value={format} onChange={e => setFormat(e.target.value as any)}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
              {format === 'image/jpeg' && <div>
                <div className="control-row"><span className="control-label">Quality</span><span className="control-value">{Math.round(quality*100)}%</span></div>
                <input type="range" className="slider" min={0.5} max={1} step={0.02} value={quality} onChange={e => setQuality(+e.target.value)} />
              </div>}
            </div>
          </div>

          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>✓ Resized to {w}×{h}px</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Original: <strong style={{ color: 'var(--text-primary)' }}>{origW}×{origH}px • {formatSize(file.size)}</strong></span>
                  <span>→</span>
                  <span>Result: <strong style={{ color: 'var(--accent-green)' }}>{w}×{h}px • {formatSize(result.size)}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => downloadBlob(result, `${stripExt(file.name)}_${w}x${h}.${ext}`)}>
                  <Download size={16} /> Download ({w}×{h} • {formatSize(result.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Resize Again</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={resize} disabled={loading}>
              {loading ? <><span className="spinner" /> Resizing...</> : `Resize to ${w}×${h}px`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
