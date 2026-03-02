import type {
  SendMagicLinkResponseDto,
  StaffLoginResponseDto,
  VerifyOtpResponseDto,
} from '@contracts';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  public constructor(private readonly jwtService: JwtService) {}

  public staffLogin(email: string): StaffLoginResponseDto {
    const accessToken = this.jwtService.sign({
      sub: email,
      tenantId: 'tenant_demo_1',
      role: 'owner',
    });

    return { accessToken };
  }

  public sendMagicLink(email: string): SendMagicLinkResponseDto {
    return { sent: true, email };
  }

  public verifyOtp(email: string, otp: string): VerifyOtpResponseDto {
    const verified = otp.length === 6;
    return {
      verified,
      token: verified ? `session_${email}` : '',
    };
  }
}
