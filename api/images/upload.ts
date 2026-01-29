import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, withLogging, withErrorHandler, requireAuth } from '../../src/server/middleware/index.js';
import { parseMultipartForm, apiConfig } from '../../src/server/utils/multipart.js';
import { imageService } from '../../src/server/services/index.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const files = await parseMultipartForm(req);
  const result = await imageService.uploadFiles(files);

  res.status(200).json({
    success: true,
    count: result.uploaded.length,
    uploaded: result.uploaded,
    errors: result.errors.length > 0 ? result.errors : undefined,
  });
}

export const config = apiConfig;

export default withCors(withLogging(withErrorHandler(requireAuth(handler))));
