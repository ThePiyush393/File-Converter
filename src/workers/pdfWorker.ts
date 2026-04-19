import { PDFDocument } from 'pdf-lib';

// Define message types
type WorkerMessage = 
  | { type: 'COMPRESS_PDF'; payload: { file: File; quality: number } }
  | { type: 'MERGE_PDF'; payload: { files: File[] } };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'COMPRESS_PDF': {
        // Simplified mock compression for the initial worker setup
        // In reality, pdf-lib doesn't easily compress without ghostscript
        // but we can strip metadata, or use a WASM ghostscript port.
        // For now, we'll just parse and re-save.
        const arrayBuffer = await payload.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Setup some basic optimizations
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        self.postMessage({ type: 'SUCCESS', payload: { blob } });
        break;
      }
      
      case 'MERGE_PDF': {
        const mergedPdf = await PDFDocument.create();
        
        for (const file of payload.files) {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        self.postMessage({ type: 'SUCCESS', payload: { blob } });
        break;
      }

      default:
        self.postMessage({ type: 'ERROR', payload: { error: 'Unknown operation' } });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: { error: error instanceof Error ? error.message : 'Unknown error' } });
  }
};
