import { NotificationLanguage } from '@contracts';
import { ConfigService } from '@nestjs/config';

import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationTemplate } from '../enums/notification-template.enum';
import { NotificationsProcessingService } from '../notifications-processing.service';
import { NotificationsRepository } from '../notifications.repository';
import { NotificationsService } from '../notifications.service';

type NotificationsRepositoryMock = Partial<Record<keyof NotificationsRepository, jest.Mock>>;
type NotificationsProcessingServiceMock = Partial<
  Record<keyof NotificationsProcessingService, jest.Mock>
>;
type ConfigServiceMock = Partial<Record<keyof ConfigService, jest.Mock>>;

function createNotificationsRepositoryMock(): NotificationsRepositoryMock {
  return {
    createNotificationJob: jest.fn(),
    saveNotificationJob: jest.fn(),
  };
}

function createNotificationsProcessingServiceMock(): NotificationsProcessingServiceMock {
  return {
    dispatchScheduledNotification: jest.fn(),
  };
}

function createConfigServiceMock(): ConfigServiceMock {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'notifications.defaultLanguage') {
        return NotificationLanguage.EN;
      }

      if (key === 'notifications.publicBookingBaseUrl') {
        return 'https://booking.example.com';
      }

      return undefined;
    }),
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepository: NotificationsRepositoryMock;
  let notificationsProcessingService: NotificationsProcessingServiceMock;
  let configService: ConfigServiceMock;

  beforeEach(() => {
    notificationsRepository = createNotificationsRepositoryMock();
    notificationsProcessingService = createNotificationsProcessingServiceMock();
    configService = createConfigServiceMock();

    service = new NotificationsService(
      configService as unknown as ConfigService,
      notificationsRepository as unknown as NotificationsRepository,
      notificationsProcessingService as unknown as NotificationsProcessingService,
    );
  });

  it('scheduleNotification persists job and dispatches it for processing', async () => {
    notificationsRepository.createNotificationJob!.mockReturnValue({
      id: 'job-id',
      payload: {},
    });
    notificationsRepository.saveNotificationJob!.mockImplementation(async (job) => job);
    notificationsProcessingService.dispatchScheduledNotification!.mockResolvedValue(undefined);

    const result = await service.scheduleNotification({
      tenantId: 'tenant-id',
      appointmentId: 'appointment-id',
      channel: NotificationChannel.EMAIL,
      template: NotificationTemplate.BOOKING_CREATED,
      recipient: 'client@example.com',
      payload: { key: 'value' },
      scheduledAt: new Date('2099-03-10T10:00:00.000Z'),
    });

    expect(result.id).toBe('job-id');
    expect(notificationsRepository.createNotificationJob).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          key: 'value',
          lang: NotificationLanguage.EN,
        }),
      }),
    );
    expect(notificationsProcessingService.dispatchScheduledNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job-id' }),
    );
  });

  it('scheduleAppointmentNotifications creates 3 jobs for appointments starting in 2+ days', async () => {
    const scheduleSpy = jest
      .spyOn(service, 'scheduleNotification')
      .mockResolvedValue({ id: 'job-id' } as never);

    const count = await service.scheduleAppointmentNotifications({
      tenantId: 'tenant-id',
      tenantSlug: 'tenant-slug',
      appointmentId: 'appointment-id',
      recipientEmail: 'client@example.com',
      startsAt: new Date('2099-03-10T10:00:00.000Z'),
    });

    expect(count).toBe(3);
    expect(scheduleSpy).toHaveBeenCalledTimes(3);
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        template: NotificationTemplate.BOOKING_REMINDER_24H,
        payload: expect.objectContaining({
          confirmUrl: expect.any(String),
        }),
      }),
    );
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        template: NotificationTemplate.BOOKING_REMINDER_2H,
      }),
    );
    expect(scheduleSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        template: NotificationTemplate.BOOKING_CONFIRMATION_ACTION,
      }),
    );
  });

  it('sendOtpEmail schedules AUTH_OTP template notification', async () => {
    const scheduleSpy = jest
      .spyOn(service, 'scheduleNotification')
      .mockResolvedValue({ id: 'job-id' } as never);

    await service.sendOtpEmail('tenant-id', 'tenant-slug', 'client@example.com', '123456');

    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        template: NotificationTemplate.AUTH_OTP,
        payload: expect.objectContaining({
          tenantSlug: 'tenant-slug',
          otp: '123456',
        }),
      }),
    );
  });
});
