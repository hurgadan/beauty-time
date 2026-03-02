import type {
  SendMagicLinkRequestEnvelopeDto,
  SendMagicLinkResponseDto,
  VerifyOtpRequestEnvelopeDto,
  VerifyOtpResponseDto,
} from '../types';
import { ApiHttpClient } from './api-http-client';

export class AuthApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async sendMagicLink(
    payload: SendMagicLinkRequestEnvelopeDto,
  ): Promise<SendMagicLinkResponseDto> {
    return this.http.request<SendMagicLinkResponseDto>('/api/auth/client/send-magic-link', {
      method: 'POST',
      body: JSON.stringify(payload.payload),
    });
  }

  public async verifyOtp(payload: VerifyOtpRequestEnvelopeDto): Promise<VerifyOtpResponseDto> {
    return this.http.request<VerifyOtpResponseDto>('/api/auth/client/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload.payload),
    });
  }
}
