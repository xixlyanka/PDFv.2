import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseMultipart } from './utils/form.js';
import { sendAttachment, sendError } from './utils/responses.js';
import { docxBufferToPdf, normalizeFilename, xlsxBufferToPdf } from './utils/pdf.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    const { fileBuffer, filename, mimeType } = await parseMultipart(req);
    const lower = mimeType.toLowerCase();

    if (lower.includes('word') || lower.includes('officedocument.wordprocessingml.document') || filename.toLowerCase().endsWith('.docx')) {
      const pdfBuffer = await docxBufferToPdf(fileBuffer, filename);
      sendAttachment(res, pdfBuffer, normalizeFilename(filename, 'converted'), 'application/pdf');
      return;
    }

    if (lower.includes('sheet') || lower.includes('excel') || filename.toLowerCase().endsWith('.xlsx')) {
      const pdfBuffer = await xlsxBufferToPdf(fileBuffer, filename);
      sendAttachment(res, pdfBuffer, normalizeFilename(filename, 'converted'), 'application/pdf');
      return;
    }

    sendError(res, 400, 'Unsupported file type. Only DOCX/XLSX are accepted.');
  } catch (err: any) {
    sendError(res, 500, err?.message || 'Conversion failed');
  }
}
