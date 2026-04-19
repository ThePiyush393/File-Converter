import { useState } from 'react';
import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFDict } from 'pdf-lib';
import { inflate } from 'pako';
import { FileText, CheckCircle, AlertCircle, Download, Info } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize, downloadBlob } from '../utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert Uint8Array → base64 safely (avoids call stack overflow on large arrays) */
function toBase64(arr: Uint8Array): string {
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < arr.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK) as unknown as number[]);
  }
  return btoa(binary);
}

/** Load a blob URL as an HTMLImageElement */
function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

/** Draw image on canvas and re-encode as JPEG at the given quality (0–1) */
function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array | null> {
  return new Promise((res) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { res(null); return; }
        blob.arrayBuffer().then(ab => res(new Uint8Array(ab)));
      },
      'image/jpeg',
      quality
    );
  });
}

/** Convert raw RGB/Gray pixel bytes to ImageData */
function rawToImageData(raw: Uint8Array, w: number, h: number, channels: number): ImageData {
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, j = 0; i < w * h; i++, j += channels) {
    if (channels === 1) {
      rgba[i * 4 + 0] = raw[j];
      rgba[i * 4 + 1] = raw[j];
      rgba[i * 4 + 2] = raw[j];
    } else {
      rgba[i * 4 + 0] = raw[j];
      rgba[i * 4 + 1] = raw[j + 1];
      rgba[i * 4 + 2] = raw[j + 2];
    }
    rgba[i * 4 + 3] = 255;
  }
  return new ImageData(rgba, w, h);
}

/** Get a numeric PDF dict value safely */
function pdfNum(dict: PDFDict, key: string): number | null {
  const v = dict.get(PDFName.of(key));
  if (v instanceof PDFNumber) return v.asNumber();
  return null;
}

// ─── Core compression engine ─────────────────────────────────────────────────
async function compressPDFBytes(
  src: ArrayBuffer,
  quality: number,  // 0.0–1.0
  onProgress: (msg: string) => void
): Promise<{ bytes: Uint8Array; imagesFound: number; imagesCompressed: number }> {

  onProgress('Parsing PDF structure...');
  const pdfDoc = await PDFDocument.load(src, { ignoreEncryption: true });

  // Strip all metadata
  pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject('');
  pdfDoc.setKeywords([]); pdfDoc.setProducer(''); pdfDoc.setCreator('');

  const context = pdfDoc.context;
  const allObjs = context.enumerateIndirectObjects();

  let imagesFound = 0;
  let imagesCompressed = 0;
  let idx = 0;

  for (const [ref, obj] of allObjs) {
    if (!(obj instanceof PDFRawStream)) continue;

    const dict = obj.dict;
    const subtype = dict.get(PDFName.of('Subtype'))?.toString();
    if (subtype !== '/Image') continue;

    const w = pdfNum(dict, 'Width');
    const h = pdfNum(dict, 'Height');
    if (!w || !h || w * h < 8192) continue; // skip tiny images

    const isMask = dict.get(PDFName.of('ImageMask'))?.toString() === 'true';
    if (isMask) continue;

    const bpc = pdfNum(dict, 'BitsPerComponent') ?? 8;
    if (bpc !== 8) continue; // only 8-bit images

    const filter = dict.get(PDFName.of('Filter'))?.toString() ?? '';
    const colorSpace = dict.get(PDFName.of('ColorSpace'))?.toString() ?? '';
    const channels = colorSpace.includes('Gray') ? 1 : 3;

    imagesFound++;
    idx++;
    onProgress(`Re-encoding image ${idx} (${w}×${h})...`);

    try {
      const rawBytes = obj.contents;
      let canvas: HTMLCanvasElement | null = null;

      if (filter.includes('DCTDecode')) {
        // ── JPEG bytes ── use as image src directly
        const base64 = toBase64(rawBytes);
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        const img = await loadImg(dataUrl);
        canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

      } else if (filter.includes('FlateDecode') && !filter.includes('JBIG2') && !filter.includes('CCITTFax')) {
        // ── Deflate-compressed raw pixels ── inflate with pako then create ImageData
        let pixelData: Uint8Array;
        try {
          pixelData = inflate(rawBytes); // pako handles both zlib & raw deflate
        } catch {
          // May have a zlib header offset — try stripping it
          try { pixelData = inflate(rawBytes.slice(2)); } catch { continue; }
        }

        const expectedSize = w * h * channels;
        if (pixelData.length < expectedSize) continue;

        canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(rawToImageData(pixelData, w, h, channels), 0, 0);

      } else {
        // Unknown format — skip
        continue;
      }

      if (!canvas) continue;

      const newJpeg = await canvasToJpeg(canvas, quality);
      if (!newJpeg) continue;

      // Only replace if we actually saved bytes (≥5% reduction)
      if (newJpeg.length < rawBytes.length * 0.95) {
        const newStream = context.stream(newJpeg, {
          Type: 'XObject',
          Subtype: 'Image',
          Width: w,
          Height: h,
          ColorSpace: colorSpace.includes('Gray') ? PDFName.of('DeviceGray') : PDFName.of('DeviceRGB'),
          BitsPerComponent: 8,
          Filter: PDFName.of('DCTDecode'),
        });
        context.assign(ref, newStream);
        imagesCompressed++;
      }

    } catch {
      // Skip problematic images silently
      continue;
    }
  }

  onProgress('Saving compressed PDF...');
  const bytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  return { bytes, imagesFound, imagesCompressed };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(40);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<{
    blob: Blob;
    savedPct: number;
    savedBytes: number;
    imagesFound: number;
    imagesCompressed: number;
  } | null>(null);
  const [error, setError] = useState('');

  const compress = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const ab = await file.arrayBuffer();
      const { bytes, imagesFound, imagesCompressed } = await compressPDFBytes(
        ab,
        quality / 100,
        setProgress
      );
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const savedBytes = file.size - blob.size;
      const savedPct = (savedBytes / file.size) * 100;
      setResult({ blob, savedPct, savedBytes, imagesFound, imagesCompressed });
    } catch (e: any) {
      setError(e.message || 'Compression failed');
    }
    setProgress('');
    setLoading(false);
  };

  const qualityLabel =
    quality <= 20 ? 'Maximum (aggressive, visible quality loss)' :
    quality <= 40 ? 'High (significant reduction, minor loss)' :
    quality <= 65 ? 'Medium (balanced)' :
    'Low (minimal quality loss)';

  return (
    <div>
      {!file ? (
        <DropZone
          onFiles={([f]) => { setFile(f); setResult(null); setError(''); }}
          accept=".pdf,application/pdf"
          label="Drop your PDF here"
          sublabel="Processed 100% in your browser — never uploaded"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Original file */}
          <div className="file-item">
            <FileText size={20} className="file-item-icon" />
            <div className="file-item-info">
              <div className="file-item-name">{file.name}</div>
              <div className="file-item-size">
                Original: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(file.size)}</strong>
              </div>
            </div>
            <button className="file-item-remove" onClick={() => { setFile(null); setResult(null); setError(''); }}>✕</button>
          </div>

          {/* Controls */}
          <div className="controls-panel">
            <div className="control-row">
              <span className="control-label">Image Recompression Quality</span>
              <span className="control-value">{quality}%</span>
            </div>
            <input
              type="range" className="slider"
              min={5} max={90} step={5}
              value={quality}
              onChange={e => setQuality(+e.target.value)}
              disabled={loading}
            />
            <div className="slider-labels">
              <span>Maximum Compression</span>
              <span style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{qualityLabel}</span>
              <span>Best Quality</span>
            </div>

            <div className="info-box" style={{ marginTop: '0.875rem' }}>
              <Info size={14} />
              <span>
                Handles <strong>JPEG</strong> (DCTDecode) and <strong>FlateDecode</strong> embedded images.
                Works best on scanned PDFs, photo PDFs, or image-heavy documents.
                Text/vector-only PDFs compress less — that's inherent to PDF format.
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="result-panel" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <AlertCircle size={22} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <div><h4 style={{ color: 'var(--accent-red)' }}>Error</h4><p>{error}</p></div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              background: result.savedPct > 2 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${result.savedPct > 2 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: '12px', padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <CheckCircle size={26} style={{ color: result.savedPct > 2 ? 'var(--accent-green)' : 'var(--accent-yellow)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: result.savedPct > 2 ? 'var(--accent-green)' : 'var(--accent-yellow)',
                    marginBottom: '0.75rem'
                  }}>
                    {result.savedPct > 2 ? 'Compressed Successfully!' : 'Processed — Minimal Reduction'}
                  </h4>

                  {/* Before / After */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatSize(file.size)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem' }}>→</div>
                      {result.savedPct > 0 && (
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                          -{result.savedPct.toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: result.savedPct > 2 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)',
                      borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center',
                      border: `1px solid ${result.savedPct > 2 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                    }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compressed</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: result.savedPct > 2 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                        {formatSize(result.blob.size)}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {result.savedPct > 0.5 && (
                      <span>✓ Saved {formatSize(result.savedBytes)} ({result.savedPct.toFixed(1)}% smaller)</span>
                    )}
                    <span>
                      {result.imagesFound === 0
                        ? '⚠ No embedded images found — this PDF is text/vector only. Try lowering quality for metadata strip only.'
                        : `📷 Found ${result.imagesFound} image${result.imagesFound > 1 ? 's' : ''} — recompressed ${result.imagesCompressed}`
                      }
                    </span>
                    {result.imagesFound > 0 && result.imagesCompressed === 0 && (
                      <span style={{ color: 'var(--accent-yellow)' }}>
                        ⚠ Images were already well-compressed or couldn't be decoded. Try a lower quality setting.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => downloadBlob(result.blob, `compressed_${file.name}`)}
                >
                  <Download size={16} /> Download Compressed PDF ({formatSize(result.blob.size)})
                </button>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Try Again</button>
              </div>
            </div>
          )}

          {/* Action button */}
          {!result && (
            <button className="btn btn-primary btn-lg" onClick={compress} disabled={loading}>
              {loading
                ? <><span className="spinner" /> {progress || 'Compressing...'}</>
                : 'Compress PDF'
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}
