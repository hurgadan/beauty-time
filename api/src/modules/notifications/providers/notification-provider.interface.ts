import { NotificationLanguage } from '@contracts';

import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationTemplate } from '../enums/notification-template.enum';

export interface NotificationSendInput {
  tenantId: string;
  recipient: string;
  lang: NotificationLanguage;
  template: NotificationTemplate;
  payload: Record<string, unknown>;
}

export abstract class NotificationProvider {
  public abstract readonly channel: NotificationChannel;
  public abstract readonly name: string;

  public abstract send(input: NotificationSendInput): Promise<void>;
}
