import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ImageIcon, CheckCircle, Download, AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob, getExt } from '../utils';

interface Props {
  acceptedFormats?: string;
  label?: string;
}

export default function CompressImage({ acceptedFormats, label }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [maxMB, setMaxMB] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: File; pct: number } | null>(null);
  const [error, setError] = useState('');

  const compress = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: maxMB,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality,
        fileType: file.type.startsWith('image/') ? file.type as any : 'image/jpeg',
      });
      const pct = ((1 - compressed.size / file.size) * 100);
      setResult({ blob: compressed, pct: Math.max(0, pct) });
    } catch (e: any) {
      setError(e.message || 'Compression failed — try a different file or lower quality setting');
    }
    setLoading(false);
  };

  const reset = () => { setFile(null); setResult(null); setError(''); };
  const ext = file ? getExt(file.name) : '';

  return (
    <div>
      {!file ? (
        <DropZone
          onFiles={([f]) => { setFile(f); setResult(null); }}
          accept={acceptedFormats ?? 'image/*'}
          label={label ?? 'Drop your image here'}
          sublabel="100% offline — no upload, instant processing"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Original file */}
          <div className="file-item">
            <ImageIcon size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">
                Original: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(file.size)}</strong>
                &nbsp;• {ext.toUpperCase()}
              </div>
            </div>
            <button className="file-item-remove" onClick={reset}>✕</button>
          </div>

          {/* Controls */}
          <div className="controls-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="control-row">
                <span className="control-label">Quality</span>
                <span className="control-value">
                  {quality >= 0.85 ? 'High' : quality >= 0.6 ? 'Medium' : 'Low'} ({Math.round(quality * 100)}%)
                </span>
              </div>
              <input
                type="range" className="slider"
                min={0.05} max={0.95} step={0.05}
                value={quality}
                onChange={e => setQuality(+e.target.value)}
                disabled={loading}
              />
              <div className="slider-labels"><span>Max Compression</span><span>Best Quality</span></div>
            </div>
            <div>
              <div className="control-row">
                <span className="control-label">Target Max File Size</span>
                <span className="control-value">{maxMB < 1 ? `${Math.round(maxMB * 1000)} KB` : `${maxMB} MB`}</span>
              </div>
              <input
                type="range" className="slider"
                min={0.05} max={10} step={0.05}
                value={maxMB}
                onChange={e => setMaxMB(+e.target.value)}
                disabled={loading}
              />
              <div className="slider-labels"><span>50 KB</span><span>5 MB</span><span>10 MB</span></div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="result-panel" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <AlertCircle size={22} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <div><h4 style={{ color: 'var(--accent-red)' }}>Error</h4><p style={{ fontSize: '0.82rem' }}>{error}</p></div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px', padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
              {/* Size comparison */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <CheckCircle size={26} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.75rem' }}>Compressed Successfully!</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatSize(file.size)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>→</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>-{result.pct.toFixed(0)}%</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compressed</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-green)' }}>{formatSize(result.blob.size)}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Saved {formatSize(file.size - result.blob.size)} ({result.pct.toFixed(1)}% smaller)
                  </p>
                </div>
              </div>

              {/* Download with size inline */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => downloadBlob(result.blob, `compressed_${file.name}`)}
                >
                  <Download size={16} /> Download ({formatSize(result.blob.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Compress Again</button>
              </div>
            </div>
          )}

          {/* Compress button */}
          {!result && (
            <button className="btn btn-primary btn-lg" onClick={compress} disabled={loading}>
              {loading ? <><span className="spinner" /> Compressing...</> : 'Compress Image'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
