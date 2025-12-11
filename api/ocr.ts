import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseMultipart } from './utils/form.js';
import { pdfToText, normalizeFilename, renderPdfToTextWithOcr } from './utils/pdf.js';
import { sendAttachment, sendError } from './utils/responses.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    const { fileBuffer, filename, mimeType, fields } = await parseMultipart(req);
    if (!mimeType.includes('pdf')) {
      sendError(res, 400, 'File must be a PDF');
      return;
    }

    const lang = fields.lang || 'eng';

    let text = '';
    try {
      text = await renderPdfToTextWithOcr(fileBuffer, lang);
    } catch (ocrErr) {
      // fallback to text extraction so endpoint still responds
      text = await pdfToText(fileBuffer);
    }

    const content = text || `No extractable text found with language ${lang}.`;
    const buffer = Buffer.from(content, 'utf-8');
    const name = normalizeFilename(filename, 'ocr', '.txt');
    sendAttachment(res, buffer, name, 'text/plain');
  } catch (err: any) {
    sendError(res, 500, err?.message || 'OCR failed');
  }
}
