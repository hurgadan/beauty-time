import { AuthService } from '@modules/auth/auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SendMagicLinkDto } from './dto/auth/send-magic-link.dto';
import { SendMagicLinkResponseDto } from './dto/auth/send-magic-link.response.dto';
import { VerifyOtpDto } from './dto/auth/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/auth/verify-otp.response.dto';

@ApiTags('auth')
@Controller('auth/client')
export class PublicAuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('send-magic-link')
  @ApiOperation({ summary: 'Send client magic link' })
  @ApiBody({ type: SendMagicLinkDto })
  @ApiOkResponse({ type: SendMagicLinkResponseDto })
  public sendMagicLink(@Body() dto: SendMagicLinkDto): SendMagicLinkResponseDto {
    return this.authService.sendMagicLink(dto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify client OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  public verifyOtp(@Body() dto: VerifyOtpDto): VerifyOtpResponseDto {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }
}
