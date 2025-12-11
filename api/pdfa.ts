import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseMultipart } from './utils/form.js';
import { sendAttachment, sendError } from './utils/responses.js';
import { normalizeFilename, resavePdf } from './utils/pdf.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    const { fileBuffer, filename, mimeType } = await parseMultipart(req);
    if (!mimeType.includes('pdf')) {
      sendError(res, 400, 'File must be a PDF');
      return;
    }

    const pdf = await resavePdf(fileBuffer, 50);
    sendAttachment(res, Buffer.from(pdf), normalizeFilename(filename, 'pdfa'), 'application/pdf');
  } catch (err: any) {
    sendError(res, 500, err?.message || 'PDF/A conversion failed');
  }
}
