import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CrmServicesController } from './crm-services.controller';
import { ServiceEntity } from './dao/service.entity';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ServiceEntity])],
  controllers: [CrmServicesController],
  providers: [ServicesRepository, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
