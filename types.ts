export type FileType = 'PDF' | 'DOCX' | 'PPTX' | 'JPG' | 'PNG' | 'XLSX' | 'UNKNOWN';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  previewUrl?: string;
  type: FileType;
  size: number;
}

export interface ProcessingResult {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: string; // formatted
  message?: string;
  pagesProcessed?: number;
  extraInfo?: Record<string, unknown>;
}

export type OcrMode = 'local' | 'server';

export type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface AdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

export interface AppStats {
  totalFiles: number;
  totalSizeSaved: number; // in bytes
  toolsUsage: Record<string, number>;
}

// Global Library Types
declare global {
  interface Window {
    mammoth: any;
    jspdf: {
      jsPDF: any;
    };
    PDFLib: any;
    pdfjsLib: any;
    JSZip: any;
    confetti: any;
    XLSX: any;
    html2canvas: any;
    Tesseract: any;
  }
}