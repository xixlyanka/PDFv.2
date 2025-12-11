import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseMultipart } from './utils/form.js';
import { htmlToPdfBuffer, normalizeFilename } from './utils/pdf.js';
import { sendAttachment, sendError } from './utils/responses.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    // html can come either as form field or as uploaded file
    let html = '';
    let filename = 'html_export.html';

    try {
      const { fileBuffer, filename: uploadedName, fields } = await parseMultipart(req);
      html = fields.html || fileBuffer.toString('utf-8');
      filename = uploadedName || filename;
    } catch (err) {
      // If multipart parsing fails, try reading raw body as text
      const body = await new Promise<string>((resolve) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk.toString('utf-8')));
        req.on('end', () => resolve(raw));
        req.on('error', () => resolve(''));
      });
      html = body;
    }

    if (!html.trim()) {
      sendError(res, 400, 'No HTML content provided');
      return;
    }

    const pdf = await htmlToPdfBuffer(html, filename);
    sendAttachment(res, pdf, normalizeFilename(filename, 'html'), 'application/pdf');
  } catch (err: any) {
    sendError(res, 500, err?.message || 'HTML to PDF failed');
  }
}
