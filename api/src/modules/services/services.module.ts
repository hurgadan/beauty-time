import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ServiceEntity } from './dao/service.entity';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ServiceEntity])],
  controllers: [ServicesController],
  providers: [ServicesRepository, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
