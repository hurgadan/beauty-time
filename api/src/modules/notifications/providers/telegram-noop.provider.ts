import { Injectable, Logger } from '@nestjs/common';

import type { NotificationSendInput } from './notification-provider.interface';
import { NotificationProvider } from './notification-provider.interface';
import { NotificationChannel } from '../enums/notification-channel.enum';

@Injectable()
export class TelegramNoopProvider extends NotificationProvider {
  public readonly channel = NotificationChannel.TELEGRAM;
  public readonly name = 'noop';

  private readonly logger = new Logger(TelegramNoopProvider.name);

  public async send(input: NotificationSendInput): Promise<void> {
    this.logger.log(
      `Noop telegram send to=${input.recipient} template=${input.template} tenant=${input.tenantId}`,
    );
  }
}
