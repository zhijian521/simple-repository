import { VercelRequest, VercelResponse } from '@vercel/node';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: VercelRequest,
  res: VercelResponse
): void => {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof ApiError) {
    const response: Record<string, unknown> = {
      error: err.message,
      statusCode: err.statusCode,
      requestId,
    };

    if (err.details) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // 未知错误
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    requestId,
  });
};

export function withErrorHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error as Error, req, res);
    }
  };
}
