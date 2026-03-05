import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationChannel } from './enums/notification-channel.enum';
import { EmailMailgunProvider } from './providers/email-mailgun.provider';
import { EmailNoopProvider } from './providers/email-noop.provider';
import { NotificationProvider } from './providers/notification-provider.interface';
import { SmsNoopProvider } from './providers/sms-noop.provider';
import { TelegramNoopProvider } from './providers/telegram-noop.provider';

@Injectable()
export class NotificationProviderRegistry {
  private readonly providersByKey = new Map<string, NotificationProvider>();

  public constructor(
    private readonly configService: ConfigService,
    emailMailgunProvider: EmailMailgunProvider,
    emailNoopProvider: EmailNoopProvider,
    smsNoopProvider: SmsNoopProvider,
    telegramNoopProvider: TelegramNoopProvider,
  ) {
    this.addProvider(emailMailgunProvider);
    this.addProvider(emailNoopProvider);
    this.addProvider(smsNoopProvider);
    this.addProvider(telegramNoopProvider);
  }

  public getProvider(channel: NotificationChannel): NotificationProvider {
    const providerName = this.resolveProviderName(channel);
    const key = toProviderKey(channel, providerName);
    const provider = this.providersByKey.get(key);

    if (!provider) {
      throw new Error(`Notification provider not configured: ${key}`);
    }

    return provider;
  }

  private addProvider(provider: NotificationProvider): void {
    this.providersByKey.set(toProviderKey(provider.channel, provider.name), provider);
  }

  private resolveProviderName(channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return this.configService.getOrThrow<string>('notifications.providers.email');
      case NotificationChannel.SMS:
        return this.configService.getOrThrow<string>('notifications.providers.sms');
      case NotificationChannel.TELEGRAM:
        return this.configService.getOrThrow<string>('notifications.providers.telegram');
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }
}

function toProviderKey(channel: NotificationChannel, providerName: string): string {
  return `${channel}:${providerName}`;
}
