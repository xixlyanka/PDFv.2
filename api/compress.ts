import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const clampLevel = (value: any) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 70;
  return Math.min(Math.max(num, 1), 100);
};

const recompressPdf = async (pdfBuffer: Buffer, level: number) => {
  const src = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));

  // Heuristic tweaks: higher level means more aggressive object stream packing
  const useObjectStreams = level >= 50;
  const objectsPerTick = level >= 80 ? 200 : level >= 50 ? 120 : 60;

  const saved = await out.save({ useObjectStreams, objectsPerTick });
  return Buffer.from(saved);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileData, level = 70 } = req.body || {};
  if (!fileData) {
    return res.status(400).json({ error: 'fileData required (base64-encoded PDF)' });
  }

  try {
    const pdfBuffer = Buffer.from(fileData, 'base64');
    const compressed = await recompressPdf(pdfBuffer, clampLevel(level));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    return res.status(200).send(compressed);
  } catch (err: any) {
    console.error('Compression failed', err);
    return res.status(500).json({ error: err?.message || 'Compression failed' });
  }
}
