import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RATE_LIMIT_OPTIONS_KEY, type RateLimitOptions } from '../decorators/rate-limit.decorator';

interface RateLimitRequest {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly requests = new Map<string, number[]>();

  public static reset(): void {
    RateLimitGuard.requests.clear();
  }

  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_OPTIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RateLimitRequest>();
    const ip = this.resolveIp(request);
    const bucketKey = `${options.key}:${ip}`;

    const now = Date.now();
    const windowMs = options.windowSeconds * 1000;
    const threshold = now - windowMs;

    const history = RateLimitGuard.requests.get(bucketKey) ?? [];
    const recentRequests = history.filter((value) => value > threshold);

    if (recentRequests.length >= options.maxRequests) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recentRequests.push(now);
    RateLimitGuard.requests.set(bucketKey, recentRequests);

    this.cleanupOldBuckets(threshold);

    return true;
  }

  private resolveIp(request: RateLimitRequest): string {
    const xForwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(xForwardedFor) && xForwardedFor[0]) {
      return xForwardedFor[0].split(',')[0].trim();
    }

    if (typeof xForwardedFor === 'string' && xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    return request.ip ?? 'unknown';
  }

  private cleanupOldBuckets(threshold: number): void {
    if (RateLimitGuard.requests.size <= 5000) {
      return;
    }

    for (const [key, values] of RateLimitGuard.requests.entries()) {
      const nextValues = values.filter((value) => value > threshold);
      if (nextValues.length) {
        RateLimitGuard.requests.set(key, nextValues);
      } else {
        RateLimitGuard.requests.delete(key);
      }
    }
  }
}
