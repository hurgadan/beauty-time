import { Module } from '@nestjs/common';

import { PublicAuthController } from './public-auth.controller';
import { PublicBookingController } from './public-booking.controller';
import { AuthModule } from '../auth/auth.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [AuthModule, BookingModule],
  controllers: [PublicBookingController, PublicAuthController],
})
export class PublicModule {}
