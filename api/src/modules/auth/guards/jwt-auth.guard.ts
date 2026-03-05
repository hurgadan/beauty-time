import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { RequestWithUser } from '../types/request-with-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorizationHeader = request.headers.authorization;
    const authHeader = Array.isArray(authorizationHeader)
      ? authorizationHeader[0]
      : authorizationHeader;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('auth.jwtSecret'),
      });

      request.user = {
        sub: String(payload.sub),
        tenantId: String(payload.tenantId),
        role: payload.role === 'owner' || payload.role === 'client' ? payload.role : 'staff',
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
