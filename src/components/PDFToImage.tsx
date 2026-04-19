import { useState } from 'react';
import { FileText, ImageIcon } from 'lucide-react';
import DropZone from './DropZone';
import { formatSize } from '../utils';
import ComingSoon from './ComingSoon';

// pdfjs-dist is required for PDF→Image conversion.
// It needs to be installed with: npm install pdfjs-dist
// Once installed, this component will be fully functional.
// For now, we show a helpful message.

export default function PDFToImage() {
  const [hasFile, setHasFile] = useState(false);

  // Show the coming-soon state if pdfjs-dist is not available
  // (Swap this out once `npm install pdfjs-dist` succeeds)
  if (!hasFile) {
    return (
      <div>
        <div className="info-box" style={{ marginBottom: '1rem' }}>
          <ImageIcon size={14} />
          <span>
            <strong>PDF → Image</strong> requires the <code>pdfjs-dist</code> package.
            Run <code style={{ background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>npm install pdfjs-dist</code> in your project folder, then refresh.
          </span>
        </div>
        <DropZone
          onFiles={([f]) => setHasFile(true)}
          accept=".pdf"
          label="Drop PDF to convert to images"
          sublabel="Requires pdfjs-dist — see note above"
        />
      </div>
    );
  }

  return (
    <ComingSoon
      toolName="PDF to Image"
      description="Install pdfjs-dist to enable this tool."
      note="Run: npm install pdfjs-dist  — then reload the app."
    />
  );
}
