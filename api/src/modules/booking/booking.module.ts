import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingAppointmentsRepository } from './booking-appointments.repository';
import { BookingAppointmentsService } from './booking-appointments.service';
import { BookingPublicRepository } from './booking-public.repository';
import { BookingService } from './booking.service';
import { CrmBookingAppointmentsController } from './crm-booking-appointments.controller';
import { AppointmentEntity } from './dao/appointment.entity';
import { AuthModule } from '../auth/auth.module';
import { ClientEntity } from '../clients/dao/client.entity';
import { ServiceEntity } from '../services/dao/service.entity';
import { StaffEntity } from '../staff/dao/staff.entity';
import { TimeOffEntity } from '../staff/dao/time-off.entity';
import { WorkingHoursEntity } from '../staff/dao/working-hours.entity';
import { TenantEntity } from '../tenant/dao/tenant.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      AppointmentEntity,
      ServiceEntity,
      ClientEntity,
      StaffEntity,
      TenantEntity,
      WorkingHoursEntity,
      TimeOffEntity,
    ]),
  ],
  controllers: [CrmBookingAppointmentsController],
  providers: [
    BookingService,
    BookingPublicRepository,
    BookingAppointmentsRepository,
    BookingAppointmentsService,
  ],
  exports: [BookingService],
})
export class BookingModule {}
