import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLOUDCONVERT_API = 'https://api.cloudconvert.com/v2';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

type JobResponse = {
  data?: {
    id: string;
    status: string;
    tasks?: Array<{
      id: string;
      name: string;
      operation: string;
      status: string;
      result?: { files?: Array<{ url: string; filename: string }> };
    }>;
  };
};

const levelToQuality = (level: number) => {
  if (level >= 75) return 'low';
  if (level >= 40) return 'medium';
  return 'high';
};

async function waitForJob(jobId: string, token: string) {
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to poll job: ${text}`);
    }

    const json = (await res.json()) as JobResponse;
    const status = json.data?.status;
    if (status === 'finished') return json;
    if (status === 'error' || status === 'failed') throw new Error('Compression job failed');

    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Compression job timeout');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.CLOUDCONVERT_API_KEY;
  if (!token) {
    return res.status(500).json({ error: 'CLOUDCONVERT_API_KEY is not configured' });
  }

  const { fileName, fileData, level = 50 } = req.body || {};
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing fileName or fileData (base64)' });
  }

  try {
    const quality = levelToQuality(Number(level) || 50);
    const createJob = await fetch(`${CLOUDCONVERT_API}/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          import_file: {
            operation: 'import/base64',
            file: fileData,
            filename: fileName,
          },
          compress: {
            operation: 'compress',
            input: 'import_file',
            output_format: 'pdf',
            engine: 'qpdf',
            quality,
          },
          export_file: {
            operation: 'export/url',
            input: 'compress',
          },
        },
      }),
    });

    if (!createJob.ok) {
      const text = await createJob.text();
      return res.status(502).json({ error: 'Failed to create compression job', details: text });
    }

    const jobJson = (await createJob.json()) as JobResponse;
    const jobId = jobJson.data?.id;
    if (!jobId) return res.status(502).json({ error: 'Compression job id missing' });

    const finalJob = await waitForJob(jobId, token);
    const exportTask = finalJob.data?.tasks?.find((t) => t.operation === 'export/url');
    const fileUrl = exportTask?.result?.files?.[0]?.url;
    const outName = exportTask?.result?.files?.[0]?.filename || `compressed_${fileName}`;

    if (!fileUrl) return res.status(502).json({ error: 'Compression result not available' });

    const download = await fetch(fileUrl);
    if (!download.ok) {
      const text = await download.text();
      return res.status(502).json({ error: 'Failed to download compressed file', details: text });
    }

    const buffer = Buffer.from(await download.arrayBuffer());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.status(200).send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Compression failed' });
  }
}
