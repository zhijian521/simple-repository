import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, withLogging, withErrorHandler, requireAuth } from '../../src/server/middleware/index.js';
import { imageService } from '../../src/server/services/index.js';

async function handler(_req: VercelRequest, res: VercelResponse) {
  const images = await imageService.getImages();

  res.status(200).json({
    success: true,
    count: images.length,
    images,
  });
}

export default withCors(withLogging(withErrorHandler(requireAuth(handler))));
