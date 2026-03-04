import { createHash, timingSafeEqual } from 'node:crypto';

import type {
  SendMagicLinkResponseDto,
  StaffLoginResponseDto,
  VerifyOtpResponseDto,
} from '@contracts';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { OtpSessionRepository } from './otp-session.repository';
import { ClientsService } from '../clients/clients.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly otpSessionRepository: OtpSessionRepository,
    private readonly tenantService: TenantService,
    private readonly clientsService: ClientsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  public staffLogin(email: string): StaffLoginResponseDto {
    const accessToken = this.jwtService.sign({
      sub: email,
      tenantId: 'tenant_demo_1',
      role: 'owner',
    });

    return { accessToken };
  }

  public async sendMagicLink(tenantSlug: string, email: string): Promise<SendMagicLinkResponseDto> {
    const tenant = await this.tenantService.getBySlugOrThrow(tenantSlug);

    const normalizedEmail = normalizeEmail(email);
    const now = new Date();

    await this.otpSessionRepository.deleteExpiredOtpSessions(now);

    const resendWindowStart = new Date(now.getTime() - OTP_RESEND_WINDOW_MINUTES * 60_000);
    const recentSessions = await this.otpSessionRepository.countRecentOtpSessions(
      tenant.id,
      normalizedEmail,
      OTP_PURPOSE_BOOKING_CONFIRM,
      resendWindowStart,
    );
    if (recentSessions >= OTP_MAX_SENDS_PER_WINDOW) {
      throw new HttpException(
        'OTP send limit reached. Please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.otpSessionRepository.consumeActiveOtpSessions(
      tenant.id,
      normalizedEmail,
      OTP_PURPOSE_BOOKING_CONFIRM,
      now,
    );

    const otpCode = generateOtp();
    const otpCodeHash = hashOtp(otpCode);
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60_000);
    const existingClient = await this.clientsService.findByEmail(tenant.id, normalizedEmail);

    const otpSession = this.otpSessionRepository.createOtpSession({
      tenantId: tenant.id,
      clientId: existingClient?.id ?? null,
      email: normalizedEmail,
      otpCodeHash,
      expiresAt,
      purpose: OTP_PURPOSE_BOOKING_CONFIRM,
    });

    await this.otpSessionRepository.saveOtpSession(otpSession);

    await this.notificationsService.sendOtpEmail(tenant.id, tenant.slug, normalizedEmail, otpCode);

    return { sent: true, email: normalizedEmail };
  }

  public async verifyOtp(
    tenantSlug: string,
    email: string,
    otp: string,
  ): Promise<VerifyOtpResponseDto> {
    const tenant = await this.tenantService.getBySlugOrThrow(tenantSlug);

    const normalizedEmail = normalizeEmail(email);
    const otpSession = await this.otpSessionRepository.findLatestActiveOtpSession(
      tenant.id,
      normalizedEmail,
      OTP_PURPOSE_BOOKING_CONFIRM,
    );

    if (!otpSession) {
      return {
        verified: false,
        token: '',
      };
    }

    const now = new Date();
    if (otpSession.expiresAt <= now || otpSession.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      otpSession.consumedAt = now;
      await this.otpSessionRepository.saveOtpSession(otpSession);
      return {
        verified: false,
        token: '',
      };
    }

    if (!verifyOtpHash(otp, otpSession.otpCodeHash)) {
      otpSession.attempts += 1;
      if (otpSession.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        otpSession.consumedAt = now;
      }
      await this.otpSessionRepository.saveOtpSession(otpSession);

      return {
        verified: false,
        token: '',
      };
    }

    otpSession.attempts += 1;
    otpSession.consumedAt = now;
    await this.otpSessionRepository.saveOtpSession(otpSession);

    const client = await this.ensureClient(tenant.id, normalizedEmail, otpSession.clientId);

    const token = this.jwtService.sign({
      sub: client.id,
      tenantId: tenant.id,
      role: 'client',
      email: normalizedEmail,
    });

    return {
      verified: true,
      token,
    };
  }

  private async ensureClient(
    tenantId: string,
    email: string,
    existingClientId: string | null,
  ): Promise<{ id: string }> {
    if (existingClientId) {
      return { id: existingClientId };
    }

    const existingClient = await this.clientsService.findByEmail(tenantId, email);
    if (existingClient) {
      return { id: existingClient.id };
    }

    const client = await this.clientsService.findOrCreateByEmail(tenantId, email);
    return { id: client.id };
  }
}

const OTP_PURPOSE_BOOKING_CONFIRM = 'booking_confirm';
const OTP_TTL_MINUTES = 10;
const OTP_RESEND_WINDOW_MINUTES = 15;
const OTP_MAX_SENDS_PER_WINDOW = 3;
const OTP_MAX_VERIFY_ATTEMPTS = 5;

function generateOtp(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function verifyOtpHash(otp: string, hashHex: string): boolean {
  const provided = Buffer.from(hashOtp(otp), 'hex');
  const stored = Buffer.from(hashHex, 'hex');

  if (provided.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(provided, stored);
}
