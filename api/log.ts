import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs/promises';
import path from 'node:path';

const LOG_PATH = path.join('/tmp', 'usage-log.jsonl');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const entry = {
      ...req.body,
      ts: new Date().toISOString(),
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress,
    };

    await fs.appendFile(LOG_PATH, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to record log' });
  }
}
