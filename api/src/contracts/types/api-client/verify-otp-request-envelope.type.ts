import type { VerifyOtpRequestDto } from '../auth/verify-otp-request.type';

export interface VerifyOtpRequestEnvelopeDto {
  payload: VerifyOtpRequestDto;
}
