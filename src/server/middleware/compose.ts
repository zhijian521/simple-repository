import { VercelRequest, VercelResponse } from '@vercel/node';

export type MiddlewareFn = (
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) => (req: VercelRequest, res: VercelResponse) => Promise<void>;

export function compose(...middlewares: MiddlewareFn[]): (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
