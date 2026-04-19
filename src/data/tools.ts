import {
  FileText,
  Image as ImageIcon,
  Book,
  Archive,
  Lock,
  Type,
  Maximize,
  Minimize,
  Scissors,
  Layers,
  Settings
} from 'lucide-react';

export const TOOLS_CATEGORIES = [
  {
    name: 'PDF Tools',
    sections: [
      {
        title: 'OPTIMIZE PDF',
        tools: [
          { name: 'Compress PDF', icon: Minimize, action: 'compress-pdf' }
        ]
      },
      {
        title: 'MERGE & SPLIT',
        tools: [
          { name: 'Merge PDF', icon: Layers, action: 'merge-pdf' },
          { name: 'Merge PDF and Image', icon: Layers, action: 'merge-pdf-image' },
          { name: 'Split PDF', icon: Scissors, action: 'split-pdf' }
        ]
      },
      {
        title: 'VIEW & EDIT',
        tools: [
          { name: 'Crop PDF Page', icon: Maximize, action: 'crop-pdf' },
          { name: 'Organize PDF', icon: Settings, action: 'organize-pdf' },
          { name: 'Rotate PDF', icon: Settings, action: 'rotate-pdf' },
          { name: 'Remove PDF Pages', icon: Scissors, action: 'remove-pdf-pages' },
          { name: 'Extract PDF', icon: FileText, action: 'extract-pdf' },
          { name: 'Extract Images', icon: ImageIcon, action: 'extract-images' },
          { name: 'Add Page Number', icon: Type, action: 'add-page-number' },
          { name: 'Add Watermark', icon: FileText, action: 'add-watermark' }
        ]
      },
      {
        title: 'CONVERT TO PDF',
        tools: [
          { name: 'Image to PDF', icon: ImageIcon, action: 'image-to-pdf' },
          { name: 'JPG to PDF', icon: ImageIcon, action: 'jpg-to-pdf' },
          { name: 'Word to PDF', icon: FileText, action: 'word-to-pdf' },
          { name: 'Powerpoint to PDF', icon: FileText, action: 'ppt-to-pdf' },
          { name: 'Excel to PDF', icon: FileText, action: 'excel-to-pdf' },
          { name: 'Text to PDF', icon: Type, action: 'text-to-pdf' }
        ]
      },
      {
        title: 'CONVERT FROM PDF',
        tools: [
          { name: 'PDF to Image', icon: ImageIcon, action: 'pdf-to-image' },
          { name: 'PDF to JPG', icon: ImageIcon, action: 'pdf-to-jpg' },
          { name: 'PDF to Word', icon: FileText, action: 'pdf-to-word' },
          { name: 'PDF to Powerpoint', icon: FileText, action: 'pdf-to-ppt' },
          { name: 'PDF to Excel', icon: FileText, action: 'pdf-to-excel' },
          { name: 'PDF to Text', icon: Type, action: 'pdf-to-text' }
        ]
      },
      {
        title: 'PDF SECURITY',
        tools: [
          { name: 'Unlock PDF', icon: Lock, action: 'unlock-pdf' },
          { name: 'Protect PDF', icon: Lock, action: 'protect-pdf' }
        ]
      }
    ]
  },
  {
    name: 'Image Tools',
    sections: [
      {
        title: 'OPTIMIZE IMAGE',
        tools: [
          { name: 'Compress Image', icon: Minimize, action: 'compress-image' },
          { name: 'Compress JPG', icon: Minimize, action: 'compress-jpg' },
          { name: 'Compress PNG', icon: Minimize, action: 'compress-png' },
          { name: 'Compress JPEG', icon: Minimize, action: 'compress-jpeg' },
          { name: 'Compress WEBP', icon: Minimize, action: 'compress-webp' },
          { name: 'Compress HEIC', icon: Minimize, action: 'compress-heic' },
          { name: 'Compress BMP', icon: Minimize, action: 'compress-bmp' }
        ]
      },
      {
        title: 'CONVERT IMAGE',
        tools: [
          { name: 'Image to JPG', icon: ImageIcon, action: 'image-to-jpg' },
          { name: 'Image to PNG', icon: ImageIcon, action: 'image-to-png' },
          { name: 'Image to JPEG', icon: ImageIcon, action: 'image-to-jpeg' },
          { name: 'Image to WEBP', icon: ImageIcon, action: 'image-to-webp' },
          { name: 'WEBP to JPEG', icon: ImageIcon, action: 'webp-to-jpeg' },
          { name: 'HEIC to JPEG', icon: ImageIcon, action: 'heic-to-jpeg' }
        ]
      },
      {
        title: 'EDIT IMAGE',
        tools: [
          { name: 'Image Crop', icon: Maximize, action: 'crop-image' },
          { name: 'Image Resize', icon: Maximize, action: 'resize-image' },
          { name: 'Image Rotate', icon: Settings, action: 'rotate-image' },
          { name: 'Image Crop Circle', icon: Maximize, action: 'crop-circle' },
          { name: 'Image Merge', icon: Layers, action: 'merge-image' },
          { name: 'Photo Signature Resize', icon: Type, action: 'signature-resize' }
        ]
      }
    ]
  },
  {
    name: 'Other Utilities',
    sections: [
      {
        title: 'CONVERT FROM EBOOK',
        tools: [
          { name: 'eBook to PDF', icon: Book, action: 'ebook-to-pdf' },
          { name: 'EPUB to PDF', icon: Book, action: 'epub-to-pdf' },
          { name: 'MOBI to PDF', icon: Book, action: 'mobi-to-pdf' },
          { name: 'AZW to PDF', icon: Book, action: 'azw-to-pdf' },
          { name: 'AZW3 to PDF', icon: Book, action: 'azw3-to-pdf' },
          { name: 'DJVU to PDF', icon: Book, action: 'djvu-to-pdf' }
        ]
      },
      {
        title: 'CONVERT TO EBOOK',
        tools: [
          { name: 'PDF to eBook', icon: Book, action: 'pdf-to-ebook' },
          { name: 'PDF to EPUB', icon: Book, action: 'pdf-to-epub' },
          { name: 'PDF to MOBI', icon: Book, action: 'pdf-to-mobi' },
          { name: 'PDF to AZW3', icon: Book, action: 'pdf-to-azw3' },
          { name: 'PDF to FB2', icon: Book, action: 'pdf-to-fb2' },
          { name: 'PDF to RTF', icon: Book, action: 'pdf-to-rtf' }
        ]
      },
      {
        title: 'CONVERTER',
        tools: [
          { name: 'Image Converter', icon: ImageIcon, action: 'convert-image' },
          { name: 'Document Converter', icon: FileText, action: 'convert-document' },
          { name: 'Excel Converter', icon: FileText, action: 'convert-excel' },
          { name: 'Presentation Converter', icon: FileText, action: 'convert-presentation' },
          { name: 'Ebook Converter', icon: Book, action: 'convert-ebook' },
          { name: 'Vector Converter', icon: Settings, action: 'convert-vector' },
          { name: 'Cad Converter', icon: Settings, action: 'convert-cad' }
        ]
      },
      {
        title: 'GIF',
        tools: [
          { name: 'Images to GIF', icon: ImageIcon, action: 'images-to-gif' },
          { name: 'GIF to Images', icon: ImageIcon, action: 'gif-to-images' }
        ]
      },
      {
        title: 'ZIP',
        tools: [
          { name: 'ZIP Maker', icon: Archive, action: 'make-zip' },
          { name: 'ZIP Extractor', icon: Archive, action: 'extract-zip' }
        ]
      },
      {
        title: 'OTHERS',
        tools: [
          { name: 'Barcode Generator', icon: Settings, action: 'barcode-generator' },
          { name: 'Password Generator', icon: Lock, action: 'password-generator' },
          { name: 'Image to Color', icon: ImageIcon, action: 'image-to-color' },
          { name: 'Color Extractor', icon: ImageIcon, action: 'color-extractor' }
        ]
      }
    ]
  }
];
