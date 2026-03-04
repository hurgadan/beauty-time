import { Injectable, Logger } from '@nestjs/common';

import type { NotificationSendInput } from './notification-provider.interface';
import { NotificationProvider } from './notification-provider.interface';
import { NotificationChannel } from '../enums/notification-channel.enum';

@Injectable()
export class SmsNoopProvider extends NotificationProvider {
  public readonly channel = NotificationChannel.SMS;
  public readonly name = 'noop';

  private readonly logger = new Logger(SmsNoopProvider.name);

  public async send(input: NotificationSendInput): Promise<void> {
    this.logger.log(
      `Noop sms send to=${input.recipient} template=${input.template} tenant=${input.tenantId}`,
    );
  }
}
