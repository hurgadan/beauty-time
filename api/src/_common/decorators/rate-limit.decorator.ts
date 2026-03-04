import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  key: string;
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_OPTIONS_KEY = 'rateLimitOptions';

export const RateLimit = (options: RateLimitOptions): MethodDecorator =>
  SetMetadata(RATE_LIMIT_OPTIONS_KEY, options);
