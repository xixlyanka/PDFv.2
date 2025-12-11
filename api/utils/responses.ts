import { VercelResponse } from '@vercel/node';

export const sendError = (res: VercelResponse, status: number, message: string) => {
  res.status(status).json({ error: message });
};

export const sendAttachment = (res: VercelResponse, buffer: Buffer, filename: string, contentType: string) => {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};
