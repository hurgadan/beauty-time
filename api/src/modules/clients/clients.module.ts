import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';
import { CrmClientsController } from './crm-clients.controller';
import { PublicClientsController } from './public-clients.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ClientEntity } from './dao/client.entity';
import { AppointmentEntity } from '../booking/dao/appointment.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    AuditModule,
    TypeOrmModule.forFeature([ClientEntity, AppointmentEntity]),
  ],
  controllers: [CrmClientsController, PublicClientsController],
  providers: [ClientsRepository, ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
