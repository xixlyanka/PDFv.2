import type { VercelRequest, VercelResponse } from '@vercel/node';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

const docxToPdfBuffer = async (file: Buffer) => {
  const { value: html } = await mammoth.convertToHtml({ buffer: file });
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk as Buffer));

  const paragraphs = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  paragraphs.forEach((para, idx) => {
    doc.text(para, { width: 520, align: 'left' });
    if (idx < paragraphs.length - 1) doc.moveDown();
  });

  doc.end();
  await new Promise((resolve) => doc.on('end', resolve));
  return Buffer.concat(chunks);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileData } = req.body || {};
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing fileName or fileData (base64)' });
  }

  try {
    const buffer = Buffer.from(fileData, 'base64');
    const pdfBuffer = await docxToPdfBuffer(buffer);

    const outName = fileName.replace(/\.docx$/i, '') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('DOCX conversion failed', err);
    return res.status(500).json({ error: err?.message || 'Unexpected error during conversion' });
  }
}
