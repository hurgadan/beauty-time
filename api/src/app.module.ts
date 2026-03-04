import { AuditModule } from '@modules/audit/audit.module';
import { AuthModule } from '@modules/auth/auth.module';
import { BookingModule } from '@modules/booking/booking.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { HealthModule } from '@modules/health/health.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ServicesModule } from '@modules/services/services.module';
import { StaffModule } from '@modules/staff/staff.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config } from './config/config';
import { DB_ENTITIES } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        entities: [...DB_ENTITIES],
        synchronize: false,
      }),
    }),
    HealthModule,
    AuditModule,
    AuthModule,
    BookingModule,
    ClientsModule,
    StaffModule,
    ServicesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
