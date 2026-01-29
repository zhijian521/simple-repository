import { VercelRequest } from '@vercel/node';
import busboy from 'busboy';

export interface UploadedFile {
  fieldname: string;
  filename: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export function readRequestBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function parseMultipartForm(req: VercelRequest): Promise<UploadedFile[]> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const files: UploadedFile[] = [];

    bb.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!filename) {
        file.resume();
        return;
      }

      const chunks: Buffer[] = [];
      file.on('data', (data: Buffer) => chunks.push(data));
      file.on('end', () => {
        const fileBuffer = Buffer.concat(chunks);
        if (fileBuffer.length > 0) {
          files.push({
            fieldname,
            filename,
            mimetype: mimeType,
            buffer: fileBuffer,
            size: fileBuffer.length,
          });
        }
      });
      file.on('error', reject);
    });

    bb.on('error', reject);
    bb.on('finish', () => resolve(files));
    bb.end(req.body);
  });
}

export const apiConfig = {
  api: {
    bodyParser: false,
  },
};
