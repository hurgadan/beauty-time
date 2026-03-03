import { AuthModule } from '@modules/auth/auth.module';
import { BookingModule } from '@modules/booking/booking.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { HealthModule } from '@modules/health/health.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { PublicModule } from '@modules/public/public.module';
import { ServicesModule } from '@modules/services/services.module';
import { StaffModule } from '@modules/staff/staff.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DB_ENTITIES } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [...DB_ENTITIES],
      synchronize: false,
    }),
    HealthModule,
    AuthModule,
    PublicModule,
    BookingModule,
    ClientsModule,
    StaffModule,
    ServicesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
