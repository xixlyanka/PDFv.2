import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseMultipart } from './utils/form.js';
import { sendAttachment, sendError } from './utils/responses.js';
import { compressPdfWithImages, normalizeFilename, resavePdf } from './utils/pdf.js';

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

    const level = Number(fields.level || '60');
    const targetLevel = isNaN(level) ? 60 : level;

    const recompressed = await compressPdfWithImages(fileBuffer, targetLevel);
    const resaved = await resavePdf(fileBuffer, targetLevel);
    const winner = recompressed.length < resaved.length ? recompressed : resaved;

    const name = normalizeFilename(filename, 'compressed', '.pdf');
    sendAttachment(res, Buffer.from(winner), name, 'application/pdf');
  } catch (err: any) {
    sendError(res, 500, err?.message || 'Compression failed');
  }
}
