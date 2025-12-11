import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_ENDPOINT = 'https://v2.convertapi.com/convert/docx/to/pdf';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.DOCX_CONVERT_API_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'DOCX_CONVERT_API_SECRET is not configured' });
  }

  const { fileName, fileData } = req.body || {};
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing fileName or fileData (base64)' });
  }

  try {
    const buffer = Buffer.from(fileData, 'base64');
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const form = new FormData();
    form.append('File', blob, fileName);

    const endpoint = process.env.DOCX_CONVERT_API_ENDPOINT || DEFAULT_ENDPOINT;
    const url = endpoint.includes('Secret=') ? endpoint : `${endpoint}?Secret=${secret}`;

    const apiResponse = await fetch(url, { method: 'POST', body: form });
    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      return res.status(502).json({ error: 'Upstream convert API failed', details: text });
    }

    const json = (await apiResponse.json()) as any;
    const fileUrl = json?.Files?.[0]?.FileUrl || json?.Files?.[0]?.Url;
    const outName = json?.Files?.[0]?.FileName || fileName.replace(/\.docx$/i, '') + '.pdf';

    if (!fileUrl) {
      return res.status(502).json({ error: 'Convert API did not return a file URL' });
    }

    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      const text = await pdfResponse.text();
      return res.status(502).json({ error: 'Failed to download converted file', details: text });
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error during conversion' });
  }
}
