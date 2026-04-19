import { useState } from 'react';
import { ImageIcon, Download } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob, stripExt, canvasToBlob } from '../utils';

type Format = 'image/jpeg' | 'image/png' | 'image/webp';

interface Props {
  targetFormat?: Format;
  label?: string;
}

const FORMAT_EXT: Record<Format, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export default function ConvertImage({ targetFormat, label }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<Format>(targetFormat ?? 'image/jpeg');
  const [quality, setQuality] = useState(0.92);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob; url: string }[]>([]);

  const addFiles = (f: File[]) => setFiles(prev => [...prev, ...f]);
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));

  const convert = async () => {
    if (!files.length) return;
    setLoading(true); setResults([]);
    const out: { name: string; blob: Blob; url: string }[] = [];
    const ext = FORMAT_EXT[format];

    for (const file of files) {
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, format, quality);
      const url = URL.createObjectURL(blob);
      out.push({ name: `${stripExt(file.name)}.${ext}`, blob, url });
    }
    setResults(out);
    setLoading(false);
  };

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });

  return (
    <div>
      <DropZone onFiles={addFiles} accept="image/*" multiple label={label ?? 'Drop images to convert'} sublabel="Converts in your browser — zero upload" />

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                <ImageIcon size={18} className="file-item-icon" />
                <div className="file-item-info">
                  <div className="file-item-name">{f.name}</div>
                  <div className="file-item-size">{formatSize(f.size)}</div>
                </div>
                <button className="file-item-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="controls-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {!targetFormat && (
              <div>
                <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Output Format</label>
                <select className="select" value={format} onChange={e => setFormat(e.target.value as Format)}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>
            )}
            {format !== 'image/png' && (
              <div>
                <div className="control-row"><span className="control-label">Quality</span><span className="control-value">{Math.round(quality * 100)}%</span></div>
                <input type="range" className="slider" min={0.5} max={1} step={0.02} value={quality} onChange={e => setQuality(+e.target.value)} />
              </div>
            )}
          </div>

          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.875rem' }}>✓ {results.length} file{results.length>1?'s':''} converted to {FORMAT_EXT[format].toUpperCase()}</p>
              {results.map((r, i) => (
                <div key={i} className="file-item">
                  <ImageIcon size={18} className="file-item-icon" />
                  <div className="file-item-info">
                    <div className="file-item-name">{r.name}</div>
                    <div className="file-item-size"><strong style={{ color: 'var(--accent-green)' }}>{formatSize(r.blob.size)}</strong></div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => downloadBlob(r.blob, r.name)}>
                    <Download size={13} /> {formatSize(r.blob.size)}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={convert} disabled={loading}>
              {loading ? <><span className="spinner" /> Converting...</> : `Convert to ${FORMAT_EXT[format].toUpperCase()}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
