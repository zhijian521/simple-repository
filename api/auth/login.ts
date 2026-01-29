import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, withLogging, withErrorHandler } from '../../src/server/middleware/index.js';
import { authService } from '../../src/server/services/index.js';
import { ApiError } from '../../src/server/middleware/errorHandler.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // 调试日志
  console.log('Login request body:', req.body);
  console.log('Expected username:', authService.getUsername());

  const { username, password } = req.body;

  if (username !== authService.getUsername()) {
    console.log('Username mismatch:', { received: username, expected: authService.getUsername() });
    throw new ApiError(401, 'Invalid username or password');
  }

  if (!authService.verifyPassword(password)) {
    console.log('Password mismatch');
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = authService.generateToken();

  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

  res.status(200).json({
    success: true,
    token,
    user: { username },
  });
}

export default withCors(withLogging(withErrorHandler(handler)));
