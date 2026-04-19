# Product Requirements Document: Universal Offline File Converter

## 1. Project Overview
A feature-rich, high-performance, fully client-side (offline) file conversion and manipulation web application. The application will leverage WebAssembly (WASM) and modern web APIs to process files directly in the browser, ensuring user privacy, instant processing, and zero server-side upload wait times.

## 2. Core Features & Tool Matrix

### PDF Tools
- **Optimize PDF:** Compress PDF (with visual quality slider).
- **Merge & Split:** Merge PDF, Merge PDF and Image, Split PDF.
- **View & Edit:** Crop PDF Page, Organize PDF, Rotate PDF, Remove PDF Pages, Extract PDF, Extract Images, Add Page Number, Add Watermark.
- **Convert to PDF:** Image to PDF, JPG to PDF, Word to PDF, Powerpoint to PDF, Excel to PDF, Text to PDF.
- **Convert from PDF:** PDF to Image, PDF to JPG, PDF to Word, PDF to Powerpoint, PDF to Excel, PDF to Text.
- **PDF Security:** Unlock PDF, Protect PDF.

### Image Tools
- **Optimize Image:** Compress Image, Compress JPG, Compress PNG, Compress JPEG, Compress WEBP, Compress HEIC, Compress BMP.
- **Convert Image:** Image to JPG, Image to PNG, Image to JPEG, Image to WEBP, WEBP to JPEG, HEIC to JPEG (Selectable output formats).
- **Edit Image:** Image Crop, Image Resize, Image Rotate, Image Crop Circle, Image Merge, Photo Signature Resize.

### Document & eBook Tools
- **Convert from eBook:** eBook to PDF, EPUB to PDF, MOBI to PDF, AZW to PDF, AZW3 to PDF, DJVU to PDF.
- **Convert to eBook:** PDF to eBook, PDF to EPUB, PDF to MOBI, PDF to AZW3, PDF to FB2, PDF to RTF.
- **Converter:** Image Converter, Document Converter, Excel Converter, Presentation Converter, Ebook Converter, Vector Converter, CAD Converter.

### Other Utilities
- **GIF:** Images to GIF, GIF to Images.
- **ZIP:** ZIP Maker, ZIP Extractor.
- **Others:** Barcode Generator, Password Generator, Image to Color, Color Extractor.

---

## 3. Technical Architecture & Stack
- **Framework:** React with Vite or Next.js (Static Export) for robust UI and component management.
- **Styling:** Vanilla CSS or Tailwind CSS for a highly advanced, premium, smooth, dark-mode preferred UI.
- **Offline Capabilities:** Progressive Web App (PWA) with Service Workers.
- **Core Processing Engines (Client-Side):**
  - `pdf-lib` / `pdf.js` for PDF manipulation.
  - `FFmpeg.wasm` for complex conversions (audio/video/complex docs if supported).
  - Canvas API & `browser-image-compression` for image optimization.
  - `jszip` for ZIP operations.
  - Web Workers to offload heavy processing from the main UI thread.

---

## 4. Master Prompt for AI Developer

**Context:** You are an elite Full-Stack AI Web Developer specializing in advanced client-side applications.
**Task:** Build a universal, fully offline, privacy-first web application for file conversion and manipulation.

**Requirements:**
1. **No Backend:** ALL processing MUST be done locally in the user's browser using WebAssembly (WASM), Web Workers, and JS libraries. No files should ever be uploaded to a server.
2. **Feature Parity:** Implement all features listed in this PRD (Image to PDF, PDF to Image, Compression with sliders, Zip/Unzip, Ebook conversions, Security tools, etc.).
3. **Advanced UI/UX:** Use a premium, highly themed, modern UI (dark mode, glassmorphism, micro-animations, smooth drag-and-drop). It must look like a top-tier SaaS product.
4. **Offline Support:** Implement Service Workers to make it a fully functional PWA that works without an internet connection after the initial load.
5. **Tech Stack:** Use React, Vite, and appropriate WASM/JS libraries (e.g., pdf-lib, jszip, browser-image-compression).
6. **Task Execution Protocol:** Follow the user's explicit directive: "Start a Ralph Loop to implement the tasks in PRD.md. Log progress to progress.txt. Use a completion promise <promise>DONE</promise>."

**Implementation Steps (The Ralph Loop):**
- **Step 1:** Initialize the Vite + React codebase.
- **Step 2:** Scaffold the foundational UI/UX layout, navigation, and theming system.
- **Step 3:** Implement core Web Worker structures for background processing.
- **Step 4:** Iteratively build and integrate each module (PDF, Image, Ebook, Misc) testing offline capability.
- **Step 5:** Continuously document progress in `progress.txt` upon completion of each atomic feature.
- **Step 6:** Output `<promise>DONE</promise>` only when the entire suite is fully functional.
