import { ApiHttpClient } from './api-http-client';
import type { SendMagicLinkResponseDto } from '../../types';
import type { SendMagicLinkDto } from '../../types';
import type { VerifyOtpResponseDto } from '../../types';
import type { VerifyOtpDto } from '../../types';

export class AuthApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async sendMagicLink(payload: SendMagicLinkDto): Promise<SendMagicLinkResponseDto> {
    return this.http.request<SendMagicLinkResponseDto>('/api/auth/client/send-magic-link', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async verifyOtp(payload: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.http.request<VerifyOtpResponseDto>('/api/auth/client/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
