import { PDFDocument } from 'pdf-lib';
import PDFParser from 'pdf-parse';
import PDFDocumentKit from 'pdfkit';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import sharp from 'sharp';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from '@napi-rs/canvas';
import { createWorker } from 'tesseract.js';

pdfjs.GlobalWorkerOptions.workerSrc = undefined as any;

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context } as any;
  }

  reset(canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: any) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    (canvasAndContext as any).canvas = null;
    (canvasAndContext as any).context = null;
  }
}

export const resavePdf = async (buffer: Buffer, level: number): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  const saveOptions = { useObjectStreams: true, addDefaultPage: false } as const;
  const bytes = await pdfDoc.save(saveOptions);
  if (bytes.length < buffer.length) {
    return bytes;
  }
  // If no win, still return the recompressed content
  if (level > 70) {
    // allow stronger recompression by resaving a second time
    const twice = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return await twice.save(saveOptions);
  }
  return bytes;
};

const pdfKitToBuffer = (doc: PDFKit.PDFDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (data) => chunks.push(data as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
    doc.end();
  });

const qualityForLevel = (level: number) => {
  const clamped = Math.max(0, Math.min(100, level));
  if (clamped >= 80) return { scale: 0.6, quality: 0.55 };
  if (clamped >= 60) return { scale: 0.75, quality: 0.65 };
  if (clamped >= 40) return { scale: 0.9, quality: 0.75 };
  return { scale: 1, quality: 0.82 };
};

export const compressPdfWithImages = async (buffer: Buffer, level: number): Promise<Buffer> => {
  const { scale, quality } = qualityForLevel(level);
  const loadingTask = pdfjs.getDocument({ data: buffer, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const factory = new NodeCanvasFactory();
  const output = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvasAndContext = factory.create(viewport.width, viewport.height);

    await page.render({
      canvasContext: canvasAndContext.context,
      canvasFactory: factory,
      viewport,
    }).promise;

    const jpegBuffer = await sharp(canvasAndContext.canvas.toBuffer('image/png'))
      .jpeg({ quality: Math.round(quality * 100), mozjpeg: true })
      .toBuffer();

    const embedded = await output.embedJpg(jpegBuffer);
    const pageCreated = output.addPage([embedded.width, embedded.height]);
    pageCreated.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    factory.destroy(canvasAndContext);
  }

  return Buffer.from(await output.save({ useObjectStreams: true }));
};

export const docxBufferToPdf = async (buffer: Buffer, filename: string): Promise<Buffer> => {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const text = html
    .replace(/<\/(p|div)>/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n');

  const doc = new PDFDocumentKit({ size: 'A4', margin: 40, info: { Title: filename } });
  doc.fontSize(12);
  doc.text(text || 'Document contained no readable text.', { align: 'left' });
  return pdfKitToBuffer(doc);
};

export const xlsxBufferToPdf = async (buffer: Buffer, filename: string): Promise<Buffer> => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Workbook has no sheets');
  }
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const doc = new PDFDocumentKit({ size: 'A4', margin: 36, info: { Title: filename } });
  doc.fontSize(11).text(`Sheet: ${sheetName}`, { underline: true });
  doc.moveDown();

  rows.forEach((row) => {
    const line = row.map((cell) => (cell === undefined || cell === null ? '' : String(cell))).join('  |  ');
    doc.text(line || ' ');
  });

  return pdfKitToBuffer(doc);
};

export const htmlToPdfBuffer = async (html: string, title = 'html-export'): Promise<Buffer> => {
  const plain = html
    .replace(/<\/(p|div)>/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  const doc = new PDFDocumentKit({ size: 'A4', margin: 36, info: { Title: title } });
  doc.fontSize(12).text(plain || 'No HTML content provided.', { align: 'left' });
  return pdfKitToBuffer(doc);
};

export const pdfToText = async (buffer: Buffer): Promise<string> => {
  const parsed = await PDFParser(buffer);
  return parsed.text || '';
};

export const renderPdfToTextWithOcr = async (buffer: Buffer, lang: string): Promise<string> => {
  const { scale } = qualityForLevel(70);
  const loadingTask = pdfjs.getDocument({ data: buffer, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const factory = new NodeCanvasFactory();
  const worker = await createWorker({ logger: () => {} });

  await worker.load();
  await worker.loadLanguage(lang || 'eng');
  await worker.initialize(lang || 'eng');

  let resultText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvasAndContext = factory.create(viewport.width, viewport.height);
    await page.render({
      canvasContext: canvasAndContext.context,
      canvasFactory: factory,
      viewport,
    }).promise;

    const pngBuffer = canvasAndContext.canvas.toBuffer('image/png');
    const { data } = await worker.recognize(pngBuffer, lang || 'eng');
    resultText += (data?.text || '').trim() + '\n\n';
    factory.destroy(canvasAndContext);
  }

  await worker.terminate();
  return resultText.trim();
};

export const normalizeFilename = (name: string, prefix: string, ext = '.pdf') => {
  const safe = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return `${prefix}_${safe}${safe.endsWith(ext) ? '' : ext}`;
};
