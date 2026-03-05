import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { CrmAuthController } from './crm-auth.controller';
import { OtpSessionEntity } from './dao/otp-session.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OtpSessionRepository } from './otp-session.repository';
import { PublicAuthController } from './public-auth.controller';
import { AuditModule } from '../audit/audit.module';
import { ClientsModule } from '../clients/clients.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpSessionEntity]),
    forwardRef(() => ClientsModule),
    AuditModule,
    NotificationsModule,
    TenantModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtSecret'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [CrmAuthController, PublicAuthController],
  providers: [AuthService, OtpSessionRepository, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
