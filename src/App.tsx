import { useState, useMemo } from 'react';
import {
  FileText, Image as ImageIcon, Book, Archive, Lock, Type,
  Maximize, Minimize, Scissors, Layers, Settings, ChevronRight,
  Search, ArrowLeft, ShieldCheck, Key, Zap, Wifi
} from 'lucide-react';
import './index.css';
import './App.css';

// Tool Components
import CompressPDF from './components/CompressPDF';
import MergePDF from './components/MergePDF';
import SplitPDF from './components/SplitPDF';
import RemovePDFPages from './components/RemovePDFPages';
import RotatePDF from './components/RotatePDF';
import AddWatermark from './components/AddWatermark';
import AddPageNumber from './components/AddPageNumber';
import ImageToPDF from './components/ImageToPDF';
import PDFToImage from './components/PDFToImage';
import TextToPDF from './components/TextToPDF';
import PDFSecurity from './components/PDFSecurity';
import CompressImage from './components/CompressImage';
import ConvertImage from './components/ConvertImage';
import ResizeImage from './components/ResizeImage';
import RotateImage from './components/RotateImage';
import MergeImages from './components/MergeImages';
import ZipMaker from './components/ZipMaker';
import ZipExtractor from './components/ZipExtractor';
import PasswordGenerator from './components/PasswordGenerator';
import ComingSoon from './components/ComingSoon';

// ──────────────────────────────────────────────
// Tool registry: maps action → component + metadata
// ──────────────────────────────────────────────
const TOOL_REGISTRY: Record<string, { component: React.ReactNode; desc: string }> = {
  'compress-pdf':     { component: <CompressPDF />, desc: 'Reduce PDF file size with a quality slider' },
  'merge-pdf':        { component: <MergePDF />, desc: 'Combine multiple PDF files into one' },
  'split-pdf':        { component: <SplitPDF />, desc: 'Split PDF into separate pages or ranges' },
  'remove-pdf-pages': { component: <RemovePDFPages />, desc: 'Delete specific pages from a PDF' },
  'rotate-pdf':       { component: <RotatePDF />, desc: 'Rotate PDF pages 90°, 180°, or 270°' },
  'add-watermark':    { component: <AddWatermark />, desc: 'Stamp text watermark on every page' },
  'add-page-number':  { component: <AddPageNumber />, desc: 'Stamp page numbers on PDF' },
  'image-to-pdf':     { component: <ImageToPDF />, desc: 'Convert JPG/PNG images into a PDF file' },
  'jpg-to-pdf':       { component: <ImageToPDF />, desc: 'Convert JPG images to PDF' },
  'text-to-pdf':      { component: <TextToPDF />, desc: 'Convert plain text to a PDF document' },
  'pdf-to-image':     { component: <PDFToImage />, desc: 'Convert each PDF page to PNG or JPEG' },
  'pdf-to-jpg':       { component: <PDFToImage />, desc: 'Convert PDF pages to JPG images' },
  'unlock-pdf':       { component: <PDFSecurity mode="unlock" />, desc: 'Remove password from a PDF' },
  'protect-pdf':      { component: <PDFSecurity mode="protect" />, desc: 'Add password protection to a PDF' },
  'compress-image':   { component: <CompressImage />, desc: 'Compress image with quality control' },
  'compress-jpg':     { component: <CompressImage acceptedFormats=".jpg,.jpeg" label="Drop your JPG to compress" />, desc: 'Compress JPEG image files' },
  'compress-png':     { component: <CompressImage acceptedFormats=".png" label="Drop your PNG to compress" />, desc: 'Compress PNG image files' },
  'compress-jpeg':    { component: <CompressImage acceptedFormats=".jpg,.jpeg" label="Drop your JPEG to compress" />, desc: 'Compress JPEG files' },
  'compress-webp':    { component: <CompressImage acceptedFormats=".webp" label="Drop your WEBP to compress" />, desc: 'Compress WEBP files' },
  'compress-bmp':     { component: <CompressImage acceptedFormats=".bmp" label="Drop your BMP to compress" />, desc: 'Compress BMP files' },
  'image-to-jpg':     { component: <ConvertImage targetFormat="image/jpeg" label="Drop images to convert to JPG" />, desc: 'Convert any image to JPEG format' },
  'image-to-png':     { component: <ConvertImage targetFormat="image/png" label="Drop images to convert to PNG" />, desc: 'Convert any image to PNG format' },
  'image-to-jpeg':    { component: <ConvertImage targetFormat="image/jpeg" label="Drop images to convert to JPEG" />, desc: 'Convert to JPEG format' },
  'image-to-webp':    { component: <ConvertImage targetFormat="image/webp" label="Drop images to convert to WEBP" />, desc: 'Convert to WEBP format' },
  'webp-to-jpeg':     { component: <ConvertImage targetFormat="image/jpeg" label="Drop WEBP files to convert to JPEG" />, desc: 'Convert WEBP to JPEG' },
  'convert-image':    { component: <ConvertImage />, desc: 'Convert images between JPG, PNG, WEBP' },
  'resize-image':     { component: <ResizeImage />, desc: 'Resize image to exact dimensions' },
  'rotate-image':     { component: <RotateImage />, desc: 'Rotate image by any angle' },
  'merge-image':      { component: <MergeImages />, desc: 'Combine images into one' },
  'make-zip':         { component: <ZipMaker />, desc: 'Pack files into a ZIP archive' },
  'extract-zip':      { component: <ZipExtractor />, desc: 'Extract files from ZIP archive' },
  'password-generator': { component: <PasswordGenerator />, desc: 'Generate secure random passwords' },
  // Placeholders for advanced tools requiring WASM
  'organize-pdf':     { component: <ComingSoon toolName="Organize PDF" description="Drag-and-drop page reordering coming soon." />, desc: '' },
  'crop-pdf':         { component: <ComingSoon toolName="Crop PDF Page" description="Visual crop editor coming soon." />, desc: '' },
  'extract-pdf':      { component: <ComingSoon toolName="Extract PDF" description="Extract page ranges as a new PDF." />, desc: '' },
  'extract-images':   { component: <ComingSoon toolName="Extract Images" description="Extract embedded images from PDF." />, desc: '' },
  'word-to-pdf':      { component: <ComingSoon toolName="Word to PDF" description="Requires LibreOffice WASM — coming soon." note="This feature needs heavy WASM binaries (~40MB). We'll add it in the next release." />, desc: '' },
  'ppt-to-pdf':       { component: <ComingSoon toolName="PowerPoint to PDF" description="Coming soon." />, desc: '' },
  'excel-to-pdf':     { component: <ComingSoon toolName="Excel to PDF" description="Coming soon." />, desc: '' },
  'pdf-to-word':      { component: <ComingSoon toolName="PDF to Word" description="Coming soon." />, desc: '' },
  'pdf-to-ppt':       { component: <ComingSoon toolName="PDF to PowerPoint" description="Coming soon." />, desc: '' },
  'pdf-to-excel':     { component: <ComingSoon toolName="PDF to Excel" description="Coming soon." />, desc: '' },
  'pdf-to-text':      { component: <ComingSoon toolName="PDF to Text" description="Text extraction coming soon." />, desc: '' },
  'heic-to-jpeg':     { component: <ComingSoon toolName="HEIC to JPEG" description="HEIC decoding requires a WASM decoder." />, desc: '' },
  'compress-heic':    { component: <ComingSoon toolName="Compress HEIC" description="Coming soon." />, desc: '' },
  'crop-image':       { component: <ComingSoon toolName="Image Crop" description="Interactive crop editor coming soon." />, desc: '' },
  'crop-circle':      { component: <ComingSoon toolName="Crop Circle" description="Round crop editor coming soon." />, desc: '' },
  'signature-resize': { component: <ComingSoon toolName="Photo Signature Resize" description="Resize photos to ID/signature specs." />, desc: '' },
  'images-to-gif':    { component: <ComingSoon toolName="Images to GIF" description="GIF encoder coming soon." />, desc: '' },
  'gif-to-images':    { component: <ComingSoon toolName="GIF to Images" description="GIF frame extractor coming soon." />, desc: '' },
  'merge-pdf-image':  { component: <ComingSoon toolName="Merge PDF and Image" description="Combine PDFs with images — coming soon." />, desc: '' },
  'ebook-to-pdf':     { component: <ComingSoon toolName="eBook to PDF" description="EPUB/MOBI to PDF coming soon." />, desc: '' },
  'epub-to-pdf':      { component: <ComingSoon toolName="EPUB to PDF" description="Coming soon." />, desc: '' },
  'pdf-to-epub':      { component: <ComingSoon toolName="PDF to EPUB" description="Coming soon." />, desc: '' },
  'barcode-generator': { component: <ComingSoon toolName="Barcode Generator" description="QR Code & barcode generator coming soon." />, desc: '' },
  'image-to-color':   { component: <ComingSoon toolName="Image to Color Palette" description="Color palette extractor coming soon." />, desc: '' },
  'color-extractor':  { component: <ComingSoon toolName="Color Extractor" description="Eyedropper and palette tool coming soon." />, desc: '' },
};

// ──────────────────────────────────────────────
// Tool categories for sidebar + grid
// ──────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'pdf', name: 'PDF Tools', icon: FileText,
    sections: [
      { title: 'OPTIMIZE PDF', tools: [
        { name: 'Compress PDF', icon: Minimize, action: 'compress-pdf' },
      ]},
      { title: 'MERGE & SPLIT', tools: [
        { name: 'Merge PDF', icon: Layers, action: 'merge-pdf' },
        { name: 'Merge PDF & Image', icon: Layers, action: 'merge-pdf-image' },
        { name: 'Split PDF', icon: Scissors, action: 'split-pdf' },
      ]},
      { title: 'VIEW & EDIT', tools: [
        { name: 'Crop PDF Page', icon: Maximize, action: 'crop-pdf' },
        { name: 'Organize PDF', icon: Settings, action: 'organize-pdf' },
        { name: 'Rotate PDF', icon: Settings, action: 'rotate-pdf' },
        { name: 'Remove PDF Pages', icon: Scissors, action: 'remove-pdf-pages' },
        { name: 'Extract PDF', icon: FileText, action: 'extract-pdf' },
        { name: 'Extract Images', icon: ImageIcon, action: 'extract-images' },
        { name: 'Add Page Number', icon: Type, action: 'add-page-number' },
        { name: 'Add Watermark', icon: FileText, action: 'add-watermark' },
      ]},
      { title: 'CONVERT TO PDF', tools: [
        { name: 'Image to PDF', icon: ImageIcon, action: 'image-to-pdf' },
        { name: 'JPG to PDF', icon: ImageIcon, action: 'jpg-to-pdf' },
        { name: 'Word to PDF', icon: FileText, action: 'word-to-pdf' },
        { name: 'PPT to PDF', icon: FileText, action: 'ppt-to-pdf' },
        { name: 'Excel to PDF', icon: FileText, action: 'excel-to-pdf' },
        { name: 'Text to PDF', icon: Type, action: 'text-to-pdf' },
      ]},
      { title: 'CONVERT FROM PDF', tools: [
        { name: 'PDF to Image', icon: ImageIcon, action: 'pdf-to-image' },
        { name: 'PDF to JPG', icon: ImageIcon, action: 'pdf-to-jpg' },
        { name: 'PDF to Word', icon: FileText, action: 'pdf-to-word' },
        { name: 'PDF to PPT', icon: FileText, action: 'pdf-to-ppt' },
        { name: 'PDF to Excel', icon: FileText, action: 'pdf-to-excel' },
        { name: 'PDF to Text', icon: Type, action: 'pdf-to-text' },
      ]},
      { title: 'PDF SECURITY', tools: [
        { name: 'Unlock PDF', icon: Lock, action: 'unlock-pdf' },
        { name: 'Protect PDF', icon: Lock, action: 'protect-pdf' },
      ]},
    ]
  },
  {
    id: 'image', name: 'Image Tools', icon: ImageIcon,
    sections: [
      { title: 'OPTIMIZE IMAGE', tools: [
        { name: 'Compress Image', icon: Minimize, action: 'compress-image' },
        { name: 'Compress JPG', icon: Minimize, action: 'compress-jpg' },
        { name: 'Compress PNG', icon: Minimize, action: 'compress-png' },
        { name: 'Compress JPEG', icon: Minimize, action: 'compress-jpeg' },
        { name: 'Compress WEBP', icon: Minimize, action: 'compress-webp' },
        { name: 'Compress HEIC', icon: Minimize, action: 'compress-heic' },
        { name: 'Compress BMP', icon: Minimize, action: 'compress-bmp' },
      ]},
      { title: 'CONVERT IMAGE', tools: [
        { name: 'Image to JPG', icon: ImageIcon, action: 'image-to-jpg' },
        { name: 'Image to PNG', icon: ImageIcon, action: 'image-to-png' },
        { name: 'Image to JPEG', icon: ImageIcon, action: 'image-to-jpeg' },
        { name: 'Image to WEBP', icon: ImageIcon, action: 'image-to-webp' },
        { name: 'WEBP to JPEG', icon: ImageIcon, action: 'webp-to-jpeg' },
        { name: 'HEIC to JPEG', icon: ImageIcon, action: 'heic-to-jpeg' },
        { name: 'Image Converter', icon: ImageIcon, action: 'convert-image' },
      ]},
      { title: 'EDIT IMAGE', tools: [
        { name: 'Image Crop', icon: Maximize, action: 'crop-image' },
        { name: 'Image Resize', icon: Maximize, action: 'resize-image' },
        { name: 'Image Rotate', icon: Settings, action: 'rotate-image' },
        { name: 'Image Crop Circle', icon: Maximize, action: 'crop-circle' },
        { name: 'Image Merge', icon: Layers, action: 'merge-image' },
        { name: 'Signature Resize', icon: Type, action: 'signature-resize' },
      ]},
    ]
  },
  {
    id: 'utils', name: 'Utilities', icon: Archive,
    sections: [
      { title: 'ZIP', tools: [
        { name: 'ZIP Maker', icon: Archive, action: 'make-zip' },
        { name: 'ZIP Extractor', icon: Archive, action: 'extract-zip' },
      ]},
      { title: 'EBOOK (COMING SOON)', tools: [
        { name: 'eBook to PDF', icon: Book, action: 'ebook-to-pdf' },
        { name: 'EPUB to PDF', icon: Book, action: 'epub-to-pdf' },
        { name: 'PDF to EPUB', icon: Book, action: 'pdf-to-epub' },
      ]},
      { title: 'GIF', tools: [
        { name: 'Images to GIF', icon: ImageIcon, action: 'images-to-gif' },
        { name: 'GIF to Images', icon: ImageIcon, action: 'gif-to-images' },
      ]},
      { title: 'OTHER TOOLS', tools: [
        { name: 'Password Generator', icon: Key, action: 'password-generator' },
        { name: 'Barcode Generator', icon: Settings, action: 'barcode-generator' },
        { name: 'Color Extractor', icon: ImageIcon, action: 'color-extractor' },
      ]},
    ]
  }
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.sections.flatMap(s => s.tools.map(t => ({ ...t, category: c.name }))));

// ──────────────────────────────────────────────
export default function App() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const category = CATEGORIES.find(c => c.id === activeCat)!;
  const toolMeta = activeTool ? ALL_TOOLS.find(t => t.action === activeTool) : null;

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return ALL_TOOLS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const openTool = (action: string) => { setActiveTool(action); setQuery(''); };
  const back = () => setActiveTool(null);

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Layers size={20} color="white" />
          </div>
          <div>
            <div className="logo-text">FileForge</div>
            <div className="logo-badge">100% Offline</div>
          </div>
        </div>

        <div className="sidebar-search">
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              style={{ paddingLeft: '2rem' }}
              className="select"
              placeholder="Search tools..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', overflow: 'hidden' }}>
              {searchResults.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.action} onClick={() => { openTool(t.action); setActiveCat(CATEGORIES.find(c => c.name === t.category)?.id ?? activeCat); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.82rem' }}>{t.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.category}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">Categories</p>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} className={`nav-item${activeCat === cat.id ? ' active' : ''}`}
                onClick={() => { setActiveCat(cat.id); setActiveTool(null); }}>
                <span className="nav-icon"><Icon size={15} /></span>
                {cat.name}
              </button>
            );
          })}

          <p className="nav-section-label" style={{ marginTop: '1.5rem' }}>Info</p>
          {[
            { icon: ShieldCheck, label: 'Privacy First', sub: 'Files never leave your device' },
            { icon: Zap, label: 'Instant Processing', sub: 'Powered by WebAssembly' },
            { icon: Wifi, label: 'Works Offline', sub: 'PWA — install & use anywere' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', gap: '0.625rem', padding: '0.5rem 0.5rem', borderRadius: '8px', marginBottom: '0.2rem' }}>
              <Icon size={15} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div><p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</p></div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>{category.name}</span>
            {toolMeta && <><ChevronRight size={14} /><span className="current">{toolMeta.name}</span></>}
          </div>
          <span className="topbar-badge">✓ Offline Ready</span>
        </header>

        <div className="page-content">
          {/* ── TOOL PAGE ── */}
          {activeTool && TOOL_REGISTRY[activeTool] ? (
            <div className="tool-page">
              <div className="tool-page-header">
                <button className="tool-page-back" onClick={back}><ArrowLeft size={16} /> Back</button>
                <div>
                  <div className="tool-page-title">{toolMeta?.name}</div>
                  {TOOL_REGISTRY[activeTool].desc && (
                    <div className="tool-page-desc">{TOOL_REGISTRY[activeTool].desc}</div>
                  )}
                </div>
              </div>
              {TOOL_REGISTRY[activeTool].component}
            </div>
          ) : (
            /* ── DASHBOARD ── */
            <>
              {activeCat === CATEGORIES[0].id && !activeTool && (
                <div className="hero">
                  <h1>FileForge</h1>
                  <p>Professional file conversion & editing — 100% offline, instant, private.</p>
                  <div className="hero-stats">
                    <div className="stat"><div className="stat-number">50+</div><div className="stat-label">Tools</div></div>
                    <div className="stat"><div className="stat-number">0</div><div className="stat-label">Uploads</div></div>
                    <div className="stat"><div className="stat-number">100%</div><div className="stat-label">Private</div></div>
                  </div>
                  <div className="hero-chips">
                    <span className="chip"><span className="chip-dot" />PDF Tools</span>
                    <span className="chip"><span className="chip-dot" />Image Tools</span>
                    <span className="chip"><span className="chip-dot" />ZIP Tools</span>
                    <span className="chip"><span className="chip-dot" />Works Offline</span>
                  </div>
                </div>
              )}
              {category.sections.map(section => (
                <div key={section.title} className="section-block">
                  <div className="section-header">
                    <h2>{section.title}</h2>
                    <span className="section-count">{section.tools.length}</span>
                  </div>
                  <div className="tools-grid">
                    {section.tools.map(tool => {
                      const Icon = tool.icon;
                      return (
                        <div key={tool.action} className="tool-card" onClick={() => openTool(tool.action)}>
                          <div className="tool-card-icon"><Icon size={18} /></div>
                          <span className="tool-card-name">{tool.name}</span>
                          <ChevronRight size={14} className="tool-card-arrow" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
