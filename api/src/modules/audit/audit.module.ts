import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';
import { AuditLogEntity } from './dao/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
