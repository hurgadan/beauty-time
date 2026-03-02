import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientsController } from "./clients.controller";
import { ClientsRepository } from "./clients.repository";
import { ClientsService } from "./clients.service";
import { AuthModule } from "../auth/auth.module";
import { ClientEntity } from "./dao/client.entity";
import { AppointmentEntity } from "../booking/dao/appointment.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ClientEntity, AppointmentEntity]),
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
