import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';

import { OtpSessionEntity } from './dao/otp-session.entity';

@Injectable()
export class OtpSessionRepository {
  public constructor(
    @InjectRepository(OtpSessionEntity)
    private readonly otpSessionRepository: Repository<OtpSessionEntity>,
  ) {}

  public createOtpSession(input: {
    tenantId: string;
    clientId: string | null;
    email: string;
    otpCodeHash: string;
    expiresAt: Date;
    purpose: string;
  }): OtpSessionEntity {
    return this.otpSessionRepository.create({
      tenantId: input.tenantId,
      clientId: input.clientId,
      email: input.email,
      otpCodeHash: input.otpCodeHash,
      expiresAt: input.expiresAt,
      purpose: input.purpose,
      attempts: 0,
      consumedAt: null,
    });
  }

  public async saveOtpSession(session: OtpSessionEntity): Promise<OtpSessionEntity> {
    return this.otpSessionRepository.save(session);
  }

  public async consumeActiveOtpSessions(
    tenantId: string,
    email: string,
    purpose: string,
    now: Date,
  ): Promise<void> {
    await this.otpSessionRepository.update(
      {
        tenantId,
        email,
        purpose,
        consumedAt: IsNull(),
      },
      { consumedAt: now },
    );
  }

  public async countRecentOtpSessions(
    tenantId: string,
    email: string,
    purpose: string,
    fromDate: Date,
  ): Promise<number> {
    return this.otpSessionRepository.countBy({
      tenantId,
      email,
      purpose,
      createdAt: MoreThan(fromDate),
    });
  }

  public async findLatestActiveOtpSession(
    tenantId: string,
    email: string,
    purpose: string,
  ): Promise<OtpSessionEntity | null> {
    return this.otpSessionRepository.findOne({
      where: {
        tenantId,
        email,
        purpose,
        consumedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async deleteExpiredOtpSessions(now: Date): Promise<void> {
    await this.otpSessionRepository.delete({
      expiresAt: LessThan(now),
    });
  }
}
