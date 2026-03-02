import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingAppointmentsRepository } from './booking-appointments.repository';
import { BookingAppointmentsService } from './booking-appointments.service';
import { BookingService } from './booking.service';
import { CrmBookingAppointmentsController } from './crm-booking-appointments.controller';
import { AppointmentEntity } from './dao/appointment.entity';
import { PublicBookingController } from './public-booking.controller';
import { AuthModule } from '../auth/auth.module';
import { ClientEntity } from '../clients/dao/client.entity';
import { ServiceEntity } from '../services/dao/service.entity';
import { StaffEntity } from '../staff/dao/staff.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([AppointmentEntity, ServiceEntity, ClientEntity, StaffEntity]),
  ],
  controllers: [PublicBookingController, CrmBookingAppointmentsController],
  providers: [BookingService, BookingAppointmentsRepository, BookingAppointmentsService],
})
export class BookingModule {}
