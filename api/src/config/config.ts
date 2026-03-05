import { NotificationLanguage } from '@contracts';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

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

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function resolvePort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Environment variable PORT must be a positive integer');
  }

  return port;
}

function resolveNotificationLanguage(value: string): NotificationLanguage {
  if (value === NotificationLanguage.EN) {
    return NotificationLanguage.EN;
  }

  if (value === NotificationLanguage.DE) {
    return NotificationLanguage.DE;
  }

  throw new Error('Environment variable DEFAULT_NOTIFICATION_LANG must be "en" or "de"');
}

export const config = (): AppConfig => {
  const port = resolvePort(requireEnv('PORT'));
  const databaseUrl = requireEnv('DATABASE_URL');
  const jwtSecret = requireEnv('JWT_SECRET');
  const redisUrl = requireEnv('REDIS_URL');
  const publicBookingBaseUrl = requireEnv('PUBLIC_BOOKING_BASE_URL');
  const defaultNotificationLang = resolveNotificationLanguage(
    requireEnv('DEFAULT_NOTIFICATION_LANG'),
  );
  const emailProvider = requireEnv('EMAIL_PROVIDER').toLowerCase();
  const smsProvider = requireEnv('SMS_PROVIDER').toLowerCase();
  const telegramProvider = requireEnv('TELEGRAM_PROVIDER').toLowerCase();
  const mailgunApiKey = requireEnv('MAILGUN_API_KEY');
  const mailgunDomain = requireEnv('MAILGUN_DOMAIN');
  const mailgunFrom = requireEnv('MAILGUN_FROM');

  return {
    app: {
      port,
    },
    database: {
      url: databaseUrl,
    },
    auth: {
      jwtSecret,
    },
    notifications: {
      redisUrl,
      publicBookingBaseUrl,
      defaultLanguage: defaultNotificationLang,
      providers: {
        email: emailProvider,
        sms: smsProvider,
        telegram: telegramProvider,
      },
      mailgun: {
        apiKey: mailgunApiKey,
        domain: mailgunDomain,
        from: mailgunFrom,
      },
    },
  };
};
