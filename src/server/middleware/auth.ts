import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, JWTPayload } from '../services/auth.service.js';
import { ApiError } from './errorHandler.js';

export interface AuthenticatedRequest extends VercelRequest {
  user?: JWTPayload;
}

export function requireAuth(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req: VercelRequest, res: VercelResponse) => {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    (req as any).user = decoded;
    return handler(req, res);
  };
}

function extractToken(req: VercelRequest): string | null {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Cookie
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) return tokenMatch[1];
  }

  // 3. Query parameter
  if (req.url) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  return null;
}
