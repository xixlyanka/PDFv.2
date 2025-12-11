import { VercelRequest } from '@vercel/node';
import Busboy from 'busboy';

export interface ParsedForm {
  fileBuffer: Buffer;
  filename: string;
  mimeType: string;
  fields: Record<string, string>;
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB

export const parseMultipart = (req: VercelRequest): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      reject(new Error('Missing content-type header'));
      return;
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    });

    let buffer: Buffer[] = [];
    let filename = '';
    let mimeType = '';
    const fields: Record<string, string> = {};

    busboy.on('file', (_name, file, info) => {
      filename = info.filename;
      mimeType = info.mimeType || 'application/octet-stream';
      file.on('data', (data) => buffer.push(data));
      file.on('limit', () => reject(new Error('File too large')));
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('error', (err) => reject(err));

    busboy.on('finish', () => {
      if (!filename) {
        reject(new Error('No file provided'));
        return;
      }
      resolve({ fileBuffer: Buffer.concat(buffer), filename, mimeType, fields });
    });

    req.pipe(busboy);
  });
};
