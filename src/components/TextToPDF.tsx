import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Type } from 'lucide-react';
import { downloadBlob } from '../utils';

export default function TextToPDF() {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const convert = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pageWidth = 595.28, pageHeight = 841.89;
    const lineH = fontSize * 1.5;
    const maxW = pageWidth - margin * 2;

    // Word-wrap
    const words = text.split(' ');
    const lines: string[] = [];
    let curr = '';
    for (const word of words) {
      const newLine = curr ? `${curr} ${word}` : word;
      if (font.widthOfTextAtSize(newLine, fontSize) > maxW) {
        lines.push(curr);
        curr = word;
      } else { curr = newLine; }
    }
    if (curr) lines.push(curr);
    // Split on \n too
    const finalLines = lines.flatMap(l => l.split('\n'));

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const line of finalLines) {
      if (y < margin + lineH) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineH;
    }

    const bytes = await pdfDoc.save();
    setResult(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="controls-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Font Size</label>
          <input type="number" className="select" min={6} max={72} value={fontSize} onChange={e => setFontSize(+e.target.value)} />
        </div>
        <div>
          <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Page Margin (pt)</label>
          <input type="number" className="select" min={10} max={120} value={margin} onChange={e => setMargin(+e.target.value)} />
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          color: 'var(--text-primary)', borderRadius: '10px', padding: '1rem',
          fontSize: '0.9rem', lineHeight: 1.6, minHeight: '250px', resize: 'vertical',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
      {result ? (
        <div className="result-panel">
          <Type size={22} className="result-icon" />
          <div style={{ flex: 1 }}><h4 style={{ color: 'var(--accent-green)' }}>PDF Created!</h4></div>
          <button className="btn btn-success btn-sm" onClick={() => downloadBlob(result, 'document.pdf')}>⬇ Download PDF</button>
        </div>
      ) : (
        <button className="btn btn-primary btn-lg" onClick={convert} disabled={loading || !text.trim()}>
          {loading ? <><span className="spinner" /> Creating...</> : <><Type size={16} /> Convert to PDF</>}
        </button>
      )}
    </div>
  );
}
