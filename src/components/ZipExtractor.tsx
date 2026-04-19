import { useState } from 'react';
import JSZip from 'jszip';
import { Archive, FileText, ImageIcon } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

export default function ZipExtractor() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<{ name: string; size: number; blob?: Blob }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (f: File) => {
    setZipFile(f); setEntries([]); setError('');
    setLoading(true);
    try {
      const ab = await f.arrayBuffer();
      const zip = await JSZip.loadAsync(ab);
      const list: { name: string; size: number; blob?: Blob }[] = [];
      for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const blob = await file.async('blob');
          list.push({ name, size: blob.size, blob });
        }
      }
      setEntries(list);
    } catch (e: any) { setError('Invalid or corrupted ZIP file'); }
    setLoading(false);
  };

  const getIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext ?? '')) return <ImageIcon size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div>
      {!zipFile ? (
        <DropZone onFiles={([f]) => load(f)} accept=".zip" label="Drop ZIP to extract" sublabel="All files extracted locally — no server" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="file-item">
            <Archive size={20} className="file-item-icon" />
            <div className="file-item-info"><div className="file-item-name">{zipFile.name}</div><div className="file-item-size">{formatSize(zipFile.size)} • {entries.length} files</div></div>
            <button className="file-item-remove" onClick={() => { setZipFile(null); setEntries([]); }}>✕</button>
          </div>

          {loading && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Extracting...</p>}
          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</p>}

          {entries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-green)' }}>✓ {entries.length} files extracted</p>
              {entries.map((e, i) => (
                <div key={i} className="file-item">
                  <span className="file-item-icon">{getIcon(e.name)}</span>
                  <div className="file-item-info"><div className="file-item-name">{e.name}</div><div className="file-item-size">{formatSize(e.size)}</div></div>
                  {e.blob && <button className="btn btn-success btn-sm" onClick={() => downloadBlob(e.blob!, e.name.split('/').pop()!)}>⬇</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
