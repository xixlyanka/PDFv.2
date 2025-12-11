import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const docxReady = Boolean(process.env.DOCX_CONVERT_API_SECRET);
  const compressReady = Boolean(process.env.CLOUDCONVERT_API_KEY);

  res.status(200).json({
    ok: docxReady && compressReady,
    docx: {
      configured: docxReady,
      env: 'DOCX_CONVERT_API_SECRET',
    },
    compress: {
      configured: compressReady,
      env: 'CLOUDCONVERT_API_KEY',
    },
    notes: docxReady && compressReady
      ? 'Backend endpoints are configured for DOCX->PDF and compression.'
      : 'Missing keys will cause server endpoints to return 500; client fallbacks remain available.',
  });
}
