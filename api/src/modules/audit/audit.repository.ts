import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLogEntity } from './dao/audit-log.entity';

export interface CreateAuditLogInput {
  tenantId: string | null;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
}

@Injectable()
export class AuditRepository {
  public constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  public createAuditLog(input: CreateAuditLogInput): AuditLogEntity {
    return this.auditLogRepository.create(input);
  }

  public async saveAuditLog(auditLog: AuditLogEntity): Promise<AuditLogEntity> {
    return this.auditLogRepository.save(auditLog);
  }
}
