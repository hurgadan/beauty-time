import { URL } from 'node:url';

import { NotificationLanguage } from '@contracts';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Job, Queue, Worker } from 'bullmq';

import { NotificationJobEntity } from './dao/notification-job.entity';
import { NotificationJobStatus } from './enums/notification-job-status.enum';
import { NotificationProviderRegistry } from './notification-provider.registry';
import { NotificationsRepository } from './notifications.repository';

interface NotificationQueueJobData {
  notificationJobId: string;
}

interface RedisConnectionOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db?: number;
  maxRetriesPerRequest: null;
}

@Injectable()
export class NotificationsProcessingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsProcessingService.name);

  private redisConnection: RedisConnectionOptions | null = null;
  private notificationsQueue: Queue<NotificationQueueJobData> | null = null;
  private deadLetterQueue: Queue<NotificationQueueJobData> | null = null;
  private worker: Worker<NotificationQueueJobData> | null = null;

  public constructor(
    private readonly configService: ConfigService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly providerRegistry: NotificationProviderRegistry,
  ) {}

  public async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('notifications.redisUrl');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured; BullMQ queue is disabled');
      return;
    }

    this.redisConnection = toRedisConnectionOptions(redisUrl);
    this.notificationsQueue = new Queue(NOTIFICATIONS_QUEUE_NAME, {
      connection: this.redisConnection,
    });
    this.deadLetterQueue = new Queue(NOTIFICATIONS_DLQ_NAME, {
      connection: this.redisConnection,
    });

    this.worker = new Worker(
      NOTIFICATIONS_QUEUE_NAME,
      async (job: Job<NotificationQueueJobData>) =>
        this.processNotificationJob(job.data.notificationJobId),
      {
        connection: this.redisConnection,
        concurrency: 10,
      },
    );
    this.recoverPendingNotificationsInBackground();
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.notificationsQueue) {
      await this.notificationsQueue.close();
    }
    if (this.deadLetterQueue) {
      await this.deadLetterQueue.close();
    }
  }

  public async dispatchScheduledNotification(job: NotificationJobEntity): Promise<void> {
    if (this.notificationsQueue) {
      await this.enqueueNotificationJob(job.id, job.scheduledAt);
      return;
    }

    if (job.scheduledAt <= new Date()) {
      await this.processNotificationJob(job.id);
    }
  }

  public async schedulePendingNotifications(limit = 500): Promise<number> {
    if (!this.notificationsQueue) {
      return 0;
    }

    const pendingJobs = await this.notificationsRepository.findPendingJobs(limit);
    await Promise.all(
      pendingJobs.map((job) => this.enqueueNotificationJob(job.id, job.scheduledAt)),
    );

    return pendingJobs.length;
  }

  public async sendDueNotifications(limit = 100): Promise<{ processed: number; failed: number }> {
    const dueJobs = await this.notificationsRepository.findDuePendingJobs(new Date(), limit);
    if (!dueJobs.length) {
      return { processed: 0, failed: 0 };
    }

    let failed = 0;
    for (const job of dueJobs) {
      const result = await this.processNotificationJob(job.id);
      if (!result) {
        failed += 1;
      }
    }

    return { processed: dueJobs.length, failed };
  }

  private recoverPendingNotificationsInBackground(): void {
    void this.runPendingNotificationsRecovery().catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown pending notifications recovery error';
      this.logger.error(`Pending notifications recovery failed: ${errorMessage}`);
    });
  }

  private async runPendingNotificationsRecovery(): Promise<void> {
    let totalRequeued = 0;
    let iterations = 0;

    while (iterations < NOTIFICATIONS_RECOVERY_MAX_ITERATIONS) {
      const requeued = await this.schedulePendingNotifications(NOTIFICATIONS_RECOVERY_BATCH_LIMIT);
      if (requeued === 0) {
        break;
      }

      totalRequeued += requeued;
      iterations += 1;
    }

    if (totalRequeued > 0) {
      this.logger.log(`Requeued pending notification jobs on startup: ${totalRequeued}`);
    }

    if (iterations === NOTIFICATIONS_RECOVERY_MAX_ITERATIONS) {
      this.logger.warn(
        `Pending notifications recovery reached max iterations (${NOTIFICATIONS_RECOVERY_MAX_ITERATIONS})`,
      );
    }
  }

  private async enqueueNotificationJob(jobId: string, scheduledAt: Date): Promise<void> {
    if (!this.notificationsQueue) {
      return;
    }

    await this.notificationsQueue.add(
      NOTIFICATION_SEND_JOB_NAME,
      { notificationJobId: jobId },
      {
        jobId,
        delay: Math.max(0, scheduledAt.getTime() - Date.now()),
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    );
  }

  private async processNotificationJob(notificationJobId: string): Promise<boolean> {
    const job = await this.notificationsRepository.findNotificationJobById(notificationJobId);

    if (!job || job.status !== NotificationJobStatus.PENDING) {
      return true;
    }

    if (job.scheduledAt.getTime() > Date.now()) {
      return true;
    }

    try {
      const provider = this.providerRegistry.getProvider(job.channel);
      const defaultLanguage = this.configService.get<NotificationLanguage>(
        'notifications.defaultLanguage',
      );
      await provider.send({
        tenantId: job.tenantId,
        recipient: job.recipient,
        lang: resolveNotificationLanguage(job.payload.lang, defaultLanguage),
        template: job.template,
        payload: job.payload ?? {},
      });

      job.status = NotificationJobStatus.SENT;
      job.sentAt = new Date();
      job.lastError = null;
      await this.notificationsRepository.saveNotificationJob(job);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown notification error';
      job.attempts += 1;
      job.lastError = errorMessage;

      if (job.attempts >= NOTIFICATION_MAX_ATTEMPTS) {
        job.status = NotificationJobStatus.FAILED;
        await this.notificationsRepository.saveNotificationJob(job);

        if (this.deadLetterQueue) {
          await this.deadLetterQueue.add(
            NOTIFICATION_DLQ_JOB_NAME,
            { notificationJobId: job.id },
            {
              removeOnComplete: 1000,
              removeOnFail: 1000,
            },
          );
        }

        return false;
      }

      await this.notificationsRepository.saveNotificationJob(job);

      if (this.notificationsQueue) {
        await this.notificationsQueue.add(
          NOTIFICATION_SEND_JOB_NAME,
          { notificationJobId: job.id },
          {
            jobId: `${job.id}:retry:${job.attempts}`,
            delay: calculateRetryDelayMs(job.attempts),
            removeOnComplete: 1000,
            removeOnFail: 1000,
          },
        );
      }

      return false;
    }
  }
}

const NOTIFICATIONS_QUEUE_NAME = 'notifications-queue';
const NOTIFICATIONS_DLQ_NAME = 'notifications-dlq';
const NOTIFICATION_SEND_JOB_NAME = 'send-notification';
const NOTIFICATION_DLQ_JOB_NAME = 'dead-letter-notification';
const NOTIFICATION_MAX_ATTEMPTS = 5;
const NOTIFICATIONS_RECOVERY_BATCH_LIMIT = 500;
const NOTIFICATIONS_RECOVERY_MAX_ITERATIONS = 1000;

function calculateRetryDelayMs(attempt: number): number {
  const baseMs = 30_000;
  return baseMs * Math.pow(2, attempt - 1);
}

function resolveNotificationLanguage(
  value: unknown,
  defaultLanguage?: NotificationLanguage,
): NotificationLanguage {
  if (value === NotificationLanguage.DE) {
    return NotificationLanguage.DE;
  }
  if (value === NotificationLanguage.EN) {
    return NotificationLanguage.EN;
  }

  if (defaultLanguage === NotificationLanguage.DE) {
    return NotificationLanguage.DE;
  }

  return NotificationLanguage.EN;
}

function toRedisConnectionOptions(redisUrl: string): RedisConnectionOptions {
  const parsed = new URL(redisUrl);
  const dbFromPath = parsed.pathname ? Number.parseInt(parsed.pathname.slice(1), 10) : NaN;

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    ...(Number.isFinite(dbFromPath) ? { db: dbFromPath } : {}),
    maxRetriesPerRequest: null,
  };
}
