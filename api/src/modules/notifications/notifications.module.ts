import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationJobEntity } from './dao/notification-job.entity';
import { NotificationProviderRegistry } from './notification-provider.registry';
import { NotificationsProcessingService } from './notifications-processing.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { EmailMailgunProvider } from './providers/email-mailgun.provider';
import { EmailNoopProvider } from './providers/email-noop.provider';
import { SmsNoopProvider } from './providers/sms-noop.provider';
import { TelegramNoopProvider } from './providers/telegram-noop.provider';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationJobEntity])],
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationsProcessingService,
    NotificationsService,
    NotificationProviderRegistry,
    EmailMailgunProvider,
    EmailNoopProvider,
    SmsNoopProvider,
    TelegramNoopProvider,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
