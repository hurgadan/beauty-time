import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingAppointmentsRepository } from './booking-appointments.repository';
import { BookingAppointmentsService } from './booking-appointments.service';
import { BookingPublicRepository } from './booking-public.repository';
import { BookingService } from './booking.service';
import { CrmBookingAppointmentsController } from './crm-booking-appointments.controller';
import { AppointmentEntity } from './dao/appointment.entity';
import { PublicBookingController } from './public-booking.controller';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { ServicesModule } from '../services/services.module';
import { StaffModule } from '../staff/staff.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ServicesModule,
    StaffModule,
    TenantModule,
    TypeOrmModule.forFeature([AppointmentEntity]),
  ],
  controllers: [CrmBookingAppointmentsController, PublicBookingController],
  providers: [
    BookingService,
    BookingPublicRepository,
    BookingAppointmentsRepository,
    BookingAppointmentsService,
  ],
  exports: [BookingService],
})
export class BookingModule {}
