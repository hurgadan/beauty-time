import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantEntity } from './dao/tenant.entity';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantRepository, TenantService],
  exports: [TenantService],
})
export class TenantModule {}
