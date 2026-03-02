import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { StaffEntity } from "./dao/staff.entity";
import { TimeOffEntity } from "./dao/time-off.entity";
import { WorkingHoursEntity } from "./dao/working-hours.entity";
import { StaffController } from "./staff.controller";
import { StaffRepository } from "./staff.repository";
import { StaffService } from "./staff.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([StaffEntity, WorkingHoursEntity, TimeOffEntity]),
  ],
  controllers: [StaffController],
  providers: [StaffRepository, StaffService],
  exports: [StaffService],
})
export class StaffModule {}
