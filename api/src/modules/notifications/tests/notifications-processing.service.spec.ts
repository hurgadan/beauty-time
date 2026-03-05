import { ConfigService } from '@nestjs/config';

import { NotificationJobEntity } from '../dao/notification-job.entity';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationJobStatus } from '../enums/notification-job-status.enum';
import { NotificationTemplate } from '../enums/notification-template.enum';
import { NotificationProviderRegistry } from '../notification-provider.registry';
import { NotificationsProcessingService } from '../notifications-processing.service';
import { NotificationsRepository } from '../notifications.repository';

type NotificationsRepositoryMock = Partial<Record<keyof NotificationsRepository, jest.Mock>>;
type NotificationProviderRegistryMock = Partial<
  Record<keyof NotificationProviderRegistry, jest.Mock>
>;
type ConfigServiceMock = Partial<Record<keyof ConfigService, jest.Mock>>;

function createNotificationsRepositoryMock(): NotificationsRepositoryMock {
  return {
    findDuePendingJobs: jest.fn(),
    findNotificationJobById: jest.fn(),
    saveNotificationJob: jest.fn(),
    findPendingJobs: jest.fn(),
  };
}

function createNotificationProviderRegistryMock(): NotificationProviderRegistryMock {
  return {
    getProvider: jest.fn(),
  };
}

function createConfigServiceMock(): ConfigServiceMock {
  const resolver = (key: string): unknown => {
    if (key === 'notifications.defaultLanguage') {
      return 'en';
    }

    return undefined;
  };

  return {
    get: jest.fn().mockImplementation(resolver),
    getOrThrow: jest.fn().mockImplementation((key: string) => {
      const value = resolver(key);

      if (value === undefined) {
        throw new Error(`Missing config for key ${key}`);
      }

      return value;
    }),
  };
}

describe('NotificationsProcessingService', () => {
  let service: NotificationsProcessingService;
  let notificationsRepository: NotificationsRepositoryMock;
  let providerRegistry: NotificationProviderRegistryMock;
  let configService: ConfigServiceMock;

  beforeEach(() => {
    notificationsRepository = createNotificationsRepositoryMock();
    providerRegistry = createNotificationProviderRegistryMock();
    configService = createConfigServiceMock();

    service = new NotificationsProcessingService(
      configService as unknown as ConfigService,
      notificationsRepository as unknown as NotificationsRepository,
      providerRegistry as unknown as NotificationProviderRegistry,
    );
  });

  it('sendDueNotifications sends due job and marks it as sent', async () => {
    const pendingJob = createPendingNotificationJob();
    notificationsRepository.findDuePendingJobs!.mockResolvedValue([pendingJob]);
    notificationsRepository.findNotificationJobById!.mockResolvedValue(pendingJob);
    notificationsRepository.saveNotificationJob!.mockImplementation(async (job) => job);
    providerRegistry.getProvider!.mockReturnValue({
      send: jest.fn().mockResolvedValue(undefined),
    });

    const result = await service.sendDueNotifications(10);

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(notificationsRepository.saveNotificationJob).toHaveBeenCalledWith(
      expect.objectContaining({
        id: pendingJob.id,
        status: NotificationJobStatus.SENT,
      }),
    );
  });

  it('schedulePendingNotifications returns 0 when redis queue is disabled', async () => {
    const result = await service.schedulePendingNotifications(200);

    expect(result).toBe(0);
    expect(notificationsRepository.findPendingJobs).not.toHaveBeenCalled();
  });
});

function createPendingNotificationJob(): NotificationJobEntity {
  return {
    id: 'notification-id',
    tenantId: 'tenant-id',
    tenant: null as never,
    appointmentId: 'appointment-id',
    appointment: null,
    channel: NotificationChannel.EMAIL,
    template: NotificationTemplate.BOOKING_CREATED,
    recipient: 'client@example.com',
    payload: {},
    scheduledAt: new Date('2026-02-10T10:00:00.000Z'),
    sentAt: null,
    status: NotificationJobStatus.PENDING,
    attempts: 0,
    lastError: null,
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:00:00.000Z'),
  };
}
