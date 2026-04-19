import { useState } from 'react';
import { ImageIcon, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob, canvasToBlob, stripExt } from '../utils';

export default function MergeImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('vertical');
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const addFiles = (f: File[]) => setFiles(prev => [...prev, ...f]);
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));

  const merge = async () => {
    if (files.length < 2) return;
    setLoading(true); setResult(null);

    const images = await Promise.all(files.map(f => new Promise<HTMLImageElement>((res) => {
      const img = new Image(); img.onload = () => res(img); img.src = URL.createObjectURL(f);
    })));

    const canvas = document.createElement('canvas');
    if (direction === 'horizontal') {
      canvas.width = images.reduce((s, img) => s + img.naturalWidth, 0) + gap * (images.length - 1);
      canvas.height = Math.max(...images.map(img => img.naturalHeight));
    } else {
      canvas.width = Math.max(...images.map(img => img.naturalWidth));
      canvas.height = images.reduce((s, img) => s + img.naturalHeight, 0) + gap * (images.length - 1);
    }

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offset = 0;
    images.forEach((img) => {
      if (direction === 'horizontal') { ctx.drawImage(img, offset, 0); offset += img.naturalWidth + gap; }
      else { ctx.drawImage(img, 0, offset); offset += img.naturalHeight + gap; }
    });

    const blob = await canvasToBlob(canvas, 'image/png');
    setResult(blob);
    setLoading(false);
  };

  return (
    <div>
      <DropZone onFiles={addFiles} accept="image/*" multiple label="Drop images to merge" sublabel="Combines images into one — all offline" />
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                <ImageIcon size={18} className="file-item-icon" />
                <div className="file-item-info"><div className="file-item-name">{f.name}</div><div className="file-item-size">{formatSize(f.size)}</div></div>
                <button className="file-item-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>
          <div className="controls-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Direction</label>
              <select className="select" value={direction} onChange={e => setDirection(e.target.value as any)}>
                <option value="vertical">Vertical (stack)</option>
                <option value="horizontal">Horizontal (side by side)</option>
              </select>
            </div>
            <div>
              <div className="control-row"><span className="control-label">Gap</span><span className="control-value">{gap}px</span></div>
              <input type="range" className="slider" min={0} max={100} value={gap} onChange={e => setGap(+e.target.value)} />
            </div>
            <div>
              <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Background Color</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }} />
            </div>
          </div>
          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.3rem' }}>✓ Images Merged!</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{files.length} images combined • Output: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(result.size)}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => downloadBlob(result, 'merged_image.png')}>
                  <Download size={16} /> Download ({formatSize(result.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Merge Again</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={merge} disabled={loading || files.length < 2}>
              {loading ? <><span className="spinner" /> Merging...</> : `Merge ${files.length} Images`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
