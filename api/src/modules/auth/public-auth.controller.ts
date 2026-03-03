import { AuthService } from '@modules/auth/auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SendMagicLinkDto } from './dto/public/send-magic-link.dto';
import { SendMagicLinkResponseDto } from './dto/public/send-magic-link.response.dto';
import { VerifyOtpDto } from './dto/public/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/public/verify-otp.response.dto';

@ApiTags('auth')
@Controller('auth/client')
export class PublicAuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('send-magic-link')
  @ApiOperation({ summary: 'Send client magic link' })
  @ApiBody({ type: SendMagicLinkDto })
  @ApiOkResponse({ type: SendMagicLinkResponseDto })
  public async sendMagicLink(@Body() dto: SendMagicLinkDto): Promise<SendMagicLinkResponseDto> {
    return this.authService.sendMagicLink(dto.tenantSlug, dto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify client OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  public async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto.tenantSlug, dto.email, dto.otp);
  }
}
