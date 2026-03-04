import { AuditService } from '@modules/audit/audit.service';
import { AuthService } from '@modules/auth/auth.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SendMagicLinkDto } from './dto/public/send-magic-link.dto';
import { SendMagicLinkResponseDto } from './dto/public/send-magic-link.response.dto';
import { VerifyOtpDto } from './dto/public/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/public/verify-otp.response.dto';
import type { RequestWithUser } from './types/request-with-user.interface';
import { RateLimit } from '../../_common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../_common/guards/rate-limit.guard';

@ApiTags('auth')
@UseGuards(RateLimitGuard)
@Controller('auth/client')
export class PublicAuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('send-magic-link')
  @RateLimit({ key: 'public-auth-send-magic-link', maxRequests: 5, windowSeconds: 60 })
  @ApiOperation({ summary: 'Send client magic link' })
  @ApiBody({ type: SendMagicLinkDto })
  @ApiOkResponse({ type: SendMagicLinkResponseDto })
  public async sendMagicLink(
    @Req() request: RequestWithUser,
    @Body() dto: SendMagicLinkDto,
  ): Promise<SendMagicLinkResponseDto> {
    const result = await this.authService.sendMagicLink(dto.tenantSlug, dto.email);
    await this.auditService.logFromRequest(request, {
      action: 'auth.public.send_magic_link',
      actorType: 'public',
      entityType: 'otp_session',
      metadata: {
        tenantSlug: dto.tenantSlug,
        email: result.email,
      },
    });

    return result;
  }

  @Post('verify-otp')
  @RateLimit({ key: 'public-auth-verify-otp', maxRequests: 10, windowSeconds: 60 })
  @ApiOperation({ summary: 'Verify client OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  public async verifyOtp(
    @Req() request: RequestWithUser,
    @Body() dto: VerifyOtpDto,
  ): Promise<VerifyOtpResponseDto> {
    const result = await this.authService.verifyOtp(dto.tenantSlug, dto.email, dto.otp);
    await this.auditService.logFromRequest(request, {
      action: 'auth.public.verify_otp',
      actorType: result.verified ? 'client' : 'public',
      actorId: result.verified ? dto.email.toLowerCase().trim() : null,
      entityType: 'otp_session',
      metadata: {
        tenantSlug: dto.tenantSlug,
        verified: result.verified,
      },
    });

    return result;
  }
}
