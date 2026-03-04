import { Injectable } from '@nestjs/common';

import type { NotificationSendInput } from './notification-provider.interface';
import { NotificationProvider } from './notification-provider.interface';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationTemplate } from '../enums/notification-template.enum';
import { renderTemplate } from '../utils/render-template';

@Injectable()
export class EmailMailgunProvider extends NotificationProvider {
  public readonly channel = NotificationChannel.EMAIL;
  public readonly name = 'mailgun';

  public async send(input: NotificationSendInput): Promise<void> {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = process.env.MAILGUN_FROM;

    if (!apiKey || !domain || !from) {
      throw new Error('MAILGUN_API_KEY, MAILGUN_DOMAIN and MAILGUN_FROM are required');
    }

    const { subject, text } = await renderEmail(input);
    const body = new URLSearchParams({
      from,
      to: input.recipient,
      subject,
      text,
    });

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Mailgun request failed: ${response.status} ${responseBody}`);
    }
  }
}

async function renderEmail(
  input: NotificationSendInput,
): Promise<{ subject: string; text: string }> {
  const templateName = toEmailTemplateName(input.template);
  const [subject, text] = await Promise.all([
    renderTemplate({
      lang: input.lang,
      templatePath: `${templateName}.subject.hbs`,
      templateData: input.payload,
    }),
    renderTemplate({
      lang: input.lang,
      templatePath: `${templateName}.body.hbs`,
      templateData: input.payload,
    }),
  ]);

  return { subject, text };
}

function toEmailTemplateName(template: NotificationTemplate): string {
  switch (template) {
    case NotificationTemplate.BOOKING_CREATED:
      return 'booking-created';
    case NotificationTemplate.BOOKING_REMINDER_24H:
      return 'booking-reminder-24h';
    case NotificationTemplate.BOOKING_REMINDER_2H:
      return 'booking-reminder-2h';
    case NotificationTemplate.BOOKING_CONFIRMATION_ACTION:
      return 'booking-confirmation-action';
    case NotificationTemplate.BOOKING_CONFIRMED:
      return 'booking-confirmed';
    case NotificationTemplate.BOOKING_CANCELLED:
      return 'booking-cancelled';
    case NotificationTemplate.AUTH_OTP:
      return 'auth-otp';
    default:
      return 'generic-notification';
  }
}
