import { VercelRequest, VercelResponse } from '@vercel/node';

export const logger = {
  info: (obj: Record<string, unknown>, msg?: string) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({ level: 'info', ...obj, msg }));
    }
  },
  error: (obj: Record<string, unknown>, msg?: string) => {
    console.error(JSON.stringify({ level: 'error', ...obj, msg }));
  },
  warn: (obj: Record<string, unknown>, msg?: string) => {
    console.warn(JSON.stringify({ level: 'warn', ...obj, msg }));
  },
  debug: (obj: Record<string, unknown>, msg?: string) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({ level: 'debug', ...obj, msg }));
    }
  },
};

export function withLogging(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req: VercelRequest, res: VercelResponse) => {
    const requestId = crypto.randomUUID();
    req.headers['x-request-id'] = requestId;

    const startTime = Date.now();

    logger.info(
      {
        requestId,
        method: req.method,
        url: req.url,
      },
      'Incoming request'
    );

    try {
      await handler(req, res);
      const duration = Date.now() - startTime;
      logger.info(
        { requestId, statusCode: res.statusCode, duration },
        'Request completed'
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ requestId, error, duration }, 'Request failed');
      throw error;
    }
  };
}
