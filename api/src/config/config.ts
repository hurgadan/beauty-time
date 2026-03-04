import { NotificationLanguage } from '@contracts';

export interface AppConfig {
  app: {
    port: number;
  };
  database: {
    url: string;
  };
  auth: {
    jwtSecret: string;
  };
  notifications: {
    redisUrl: string;
    publicBookingBaseUrl: string;
    defaultLanguage: NotificationLanguage;
    providers: {
      email: string;
      sms: string;
      telegram: string;
    };
    mailgun: {
      apiKey: string;
      domain: string;
      from: string;
    };
  };
}

function resolveDefaultNotificationLanguage(value: string | undefined): NotificationLanguage {
  if (value === NotificationLanguage.DE) {
    return NotificationLanguage.DE;
  }

  return NotificationLanguage.EN;
}

export const config = (): AppConfig => ({
  app: {
    port: Number(process.env.PORT ?? 4000),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  },
  notifications: {
    redisUrl: process.env.REDIS_URL ?? '',
    publicBookingBaseUrl: process.env.PUBLIC_BOOKING_BASE_URL ?? '',
    defaultLanguage: resolveDefaultNotificationLanguage(process.env.DEFAULT_NOTIFICATION_LANG),
    providers: {
      email: (process.env.EMAIL_PROVIDER ?? 'noop').toLowerCase(),
      sms: (process.env.SMS_PROVIDER ?? 'noop').toLowerCase(),
      telegram: (process.env.TELEGRAM_PROVIDER ?? 'noop').toLowerCase(),
    },
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY ?? '',
      domain: process.env.MAILGUN_DOMAIN ?? '',
      from: process.env.MAILGUN_FROM ?? '',
    },
  },
});
