import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ClientsService } from '../../clients/clients.service';
import { TenantService } from '../../tenant/tenant.service';
import { AuthService } from '../auth.service';
import { OtpSessionRepository } from '../otp-session.repository';

type OtpSessionRepositoryMock = Partial<Record<keyof OtpSessionRepository, jest.Mock>>;
type JwtServiceMock = Partial<Record<keyof JwtService, jest.Mock>>;
type TenantServiceMock = Partial<Record<keyof TenantService, jest.Mock>>;
type ClientsServiceMock = Partial<Record<keyof ClientsService, jest.Mock>>;

function createOtpSessionRepositoryMock(): OtpSessionRepositoryMock {
  return {
    deleteExpiredOtpSessions: jest.fn(),
    countRecentOtpSessions: jest.fn(),
    consumeActiveOtpSessions: jest.fn(),
    createOtpSession: jest.fn(),
    saveOtpSession: jest.fn(),
    findLatestActiveOtpSession: jest.fn(),
  };
}

function createJwtServiceMock(): JwtServiceMock {
  return {
    sign: jest.fn(),
  };
}

function createTenantServiceMock(): TenantServiceMock {
  return {
    getBySlugOrThrow: jest.fn(),
  };
}

function createClientsServiceMock(): ClientsServiceMock {
  return {
    findByEmail: jest.fn(),
    findOrCreateByEmail: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let otpSessionRepository: OtpSessionRepositoryMock;
  let jwtService: JwtServiceMock;
  let tenantService: TenantServiceMock;
  let clientsService: ClientsServiceMock;

  beforeEach(() => {
    otpSessionRepository = createOtpSessionRepositoryMock();
    jwtService = createJwtServiceMock();
    tenantService = createTenantServiceMock();
    clientsService = createClientsServiceMock();
    service = new AuthService(
      jwtService as unknown as JwtService,
      otpSessionRepository as unknown as OtpSessionRepository,
      tenantService as unknown as TenantService,
      clientsService as unknown as ClientsService,
    );
  });

  it('sendMagicLink throws NotFoundException when tenant does not exist', async () => {
    tenantService.getBySlugOrThrow!.mockRejectedValue(new NotFoundException());

    await expect(
      service.sendMagicLink('missing-tenant', 'anna@example.com'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sendMagicLink throws 429 when resend limit is reached', async () => {
    tenantService.getBySlugOrThrow!.mockResolvedValue({ id: 'tenant-id' });
    otpSessionRepository.deleteExpiredOtpSessions!.mockResolvedValue(undefined);
    otpSessionRepository.countRecentOtpSessions!.mockResolvedValue(3);

    await expect(service.sendMagicLink('tenant-slug', 'anna@example.com')).rejects.toMatchObject({
      status: 429,
    });
  });

  it('verifyOtp returns signed token when otp is valid', async () => {
    tenantService.getBySlugOrThrow!.mockResolvedValue({ id: 'tenant-id' });
    otpSessionRepository.findLatestActiveOtpSession!.mockResolvedValue({
      id: 'otp-id',
      tenantId: 'tenant-id',
      clientId: 'client-id',
      email: 'anna@example.com',
      otpCodeHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      attempts: 0,
      expiresAt: new Date('2099-03-01T10:00:00.000Z'),
      consumedAt: null,
    });
    otpSessionRepository.saveOtpSession!.mockImplementation(async (session) => session);
    clientsService.findOrCreateByEmail!.mockResolvedValue({ id: 'client-id' });
    jwtService.sign!.mockReturnValue('jwt-token');

    const result = await service.verifyOtp('tenant-slug', 'anna@example.com', '123456');

    expect(result).toEqual({
      verified: true,
      token: 'jwt-token',
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'client-id',
        tenantId: 'tenant-id',
        role: 'client',
        email: 'anna@example.com',
      }),
    );
  });

  it('verifyOtp returns false when otp does not match', async () => {
    tenantService.getBySlugOrThrow!.mockResolvedValue({ id: 'tenant-id' });
    otpSessionRepository.findLatestActiveOtpSession!.mockResolvedValue({
      id: 'otp-id',
      tenantId: 'tenant-id',
      clientId: null,
      email: 'anna@example.com',
      otpCodeHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      attempts: 0,
      expiresAt: new Date('2099-03-01T10:00:00.000Z'),
      consumedAt: null,
    });
    otpSessionRepository.saveOtpSession!.mockImplementation(async (session) => session);

    const result = await service.verifyOtp('tenant-slug', 'anna@example.com', '123456');

    expect(result).toEqual({
      verified: false,
      token: '',
    });
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
