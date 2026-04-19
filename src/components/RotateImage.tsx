import { useState } from 'react';
import { ImageIcon, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob, canvasToBlob, stripExt } from '../utils';

export default function RotateImage() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const load = (f: File) => {
    setFile(f); setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const rotate = async () => {
    if (!file) return;
    setLoading(true);
    const img = new Image();
    img.src = preview;
    await new Promise(r => { img.onload = r; });
    const radians = (angle * Math.PI) / 180;
    const sinA = Math.abs(Math.sin(radians)), cosA = Math.abs(Math.cos(radians));
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth * cosA + img.naturalHeight * sinA;
    canvas.height = img.naturalWidth * sinA + img.naturalHeight * cosA;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    const blob = await canvasToBlob(canvas, 'image/png');
    setResult(blob);
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <DropZone onFiles={([f]) => load(f)} accept="image/*" label="Drop image to rotate" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <ImageIcon size={20} className="file-item-icon" />
            <div className="file-item-info"><div className="file-item-name">{file.name}</div><div className="file-item-size">{formatSize(file.size)}</div></div>
            <button className="file-item-remove" onClick={() => setFile(null)}>✕</button>
          </div>
          {preview && <img src={preview} alt="preview" style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', transition: 'transform 0.3s', transform: `rotate(${angle}deg)` }} />}
          <div className="controls-panel">
            <p className="control-label" style={{ marginBottom: '0.75rem' }}>Rotation Angle: {angle}°</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[90, 180, 270, 45, -45, -90].map(a => (
                <button key={a} className={`btn btn-sm ${angle === a ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAngle(a)}>{a}°</button>
              ))}
            </div>
            <input type="range" className="slider" min={-180} max={180} step={1} value={angle} onChange={e => setAngle(+e.target.value)} style={{ marginTop: '0.75rem' }} />
          </div>
          {result ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h4 style={{ color: 'var(--accent-green)' }}>✓ Rotated {angle}° — Output: <strong>{formatSize(result.size)}</strong></h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => downloadBlob(result, `rotated_${stripExt(file.name)}.png`)}>
                  <Download size={16} /> Download ({formatSize(result.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Rotate Again</button>
              </div>
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
