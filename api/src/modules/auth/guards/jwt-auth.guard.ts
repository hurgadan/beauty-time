import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RequestWithUser } from '../types/request-with-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  public constructor(private readonly jwtService: JwtService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
      });

      request.user = {
        sub: String(payload.sub),
        tenantId: String(payload.tenantId),
        role: payload.role === 'owner' ? 'owner' : 'staff',
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
