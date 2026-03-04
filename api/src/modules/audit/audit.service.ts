import { Injectable, Logger } from '@nestjs/common';

import { AuditRepository } from './audit.repository';

interface AuditUser {
  sub?: string;
  tenantId?: string;
  role?: string;
}

interface AuditRequest {
  headers?: Record<string, string | string[] | undefined>;
  user?: AuditUser;
  ip?: string;
}

export interface LogAuditActionInput {
  action: string;
  tenantId?: string | null;
  actorType?: string;
  actorId?: string | null;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  public constructor(private readonly auditRepository: AuditRepository) {}

  public async logFromRequest(request: AuditRequest, input: LogAuditActionInput): Promise<void> {
    const actorType = input.actorType ?? this.resolveActorType(request.user?.role);
    const actorId = input.actorId ?? request.user?.sub ?? null;
    const tenantId = input.tenantId ?? request.user?.tenantId ?? null;
    const userAgent = extractHeader(request.headers, 'user-agent');

    try {
      const auditLog = this.auditRepository.createAuditLog({
        action: input.action,
        tenantId,
        actorType,
        actorId,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        ipAddress: request.ip ?? null,
        userAgent,
        metadata: input.metadata ?? {},
      });

      await this.auditRepository.saveAuditLog(auditLog);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown audit log error';
      this.logger.warn(`Failed to persist audit log for action ${input.action}: ${message}`);
    }
  }

  private resolveActorType(role: string | undefined): string {
    if (role === 'client') {
      return 'client';
    }

    if (role === 'owner' || role === 'staff') {
      return 'crm_staff';
    }

    return 'public';
  }
}

function extractHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | null {
  if (!headers) {
    return null;
  }

  const value = headers[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
