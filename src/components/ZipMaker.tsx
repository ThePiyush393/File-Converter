import { useState } from 'react';
import JSZip from 'jszip';
import { Archive } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function ZipMaker() {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState('archive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const addFiles = (f: File[]) => setFiles(prev => [...prev, ...f]);
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));

  const makeZip = async () => {
    if (!files.length) return;
    setLoading(true); setResult(null);
    const zip = new JSZip();
    for (const file of files) {
      const ab = await file.arrayBuffer();
      zip.file(file.name, ab);
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    setResult(blob);
    setLoading(false);
  };

  return (
    <div>
      <DropZone onFiles={addFiles} accept="*/*" multiple label="Drop files to ZIP" sublabel="All formats supported — compressed locally" />
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                <Archive size={18} className="file-item-icon" />
                <div className="file-item-info"><div className="file-item-name">{f.name}</div><div className="file-item-size">{formatSize(f.size)}</div></div>
                <button className="file-item-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>
          <div className="controls-panel">
            <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>ZIP Filename</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="select" value={zipName} onChange={e => setZipName(e.target.value)} />
              <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>.zip</span>
            </div>
          </div>
          {result ? (
            <div className="result-panel">
              <span style={{ fontSize: '1.5rem' }}>✓</span>
              <div style={{ flex: 1 }}><h4 style={{ color: 'var(--accent-green)' }}>ZIP ready! {formatSize(result.size)}</h4></div>
              <button className="btn btn-success btn-sm" onClick={() => downloadBlob(result, `${zipName}.zip`)}>⬇ Download ZIP</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={makeZip} disabled={loading}>
              {loading ? <><span className="spinner" /> Zipping...</> : `Create ZIP (${files.length} files)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
