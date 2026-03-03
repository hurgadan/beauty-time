import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';
import { CrmClientsController } from './crm-clients.controller';
import { AuthModule } from '../auth/auth.module';
import { ClientEntity } from './dao/client.entity';
import { AppointmentEntity } from '../booking/dao/appointment.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([ClientEntity, AppointmentEntity]),
  ],
  controllers: [CrmClientsController],
  providers: [ClientsRepository, ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
