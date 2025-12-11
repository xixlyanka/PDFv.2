import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const docxReady = true;
  const compressReady = true;

  res.status(200).json({
    ok: docxReady && compressReady,
    docx: {
      configured: docxReady,
      env: null,
    },
    compress: {
      configured: compressReady,
      env: null,
    },
    notes: 'Backend endpoints are self contained and do not require external keys.',
  });
}
