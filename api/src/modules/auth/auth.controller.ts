import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SendMagicLinkRequestDto } from './dto/send-magic-link.request.dto';
import { SendMagicLinkResponseDto } from './dto/send-magic-link.response.dto';
import { StaffLoginRequestDto } from './dto/staff-login.request.dto';
import { StaffLoginResponseDto } from './dto/staff-login.response.dto';
import { VerifyOtpRequestDto } from './dto/verify-otp.request.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('staff/login')
  @ApiOperation({ summary: 'Staff login' })
  @ApiBody({ type: StaffLoginRequestDto })
  @ApiOkResponse({ type: StaffLoginResponseDto })
  public staffLogin(@Body() dto: StaffLoginRequestDto): StaffLoginResponseDto {
    return this.authService.staffLogin(dto.email);
  }

  @Post('client/send-magic-link')
  @ApiOperation({ summary: 'Send client magic link' })
  @ApiBody({ type: SendMagicLinkRequestDto })
  @ApiOkResponse({ type: SendMagicLinkResponseDto })
  public sendMagicLink(@Body() dto: SendMagicLinkRequestDto): SendMagicLinkResponseDto {
    return this.authService.sendMagicLink(dto.email);
  }

  @Post('client/verify-otp')
  @ApiOperation({ summary: 'Verify client OTP' })
  @ApiBody({ type: VerifyOtpRequestDto })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  public verifyOtp(@Body() dto: VerifyOtpRequestDto): VerifyOtpResponseDto {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }
}
