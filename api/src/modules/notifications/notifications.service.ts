import { NotificationLanguage } from '@contracts';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationJobEntity } from './dao/notification-job.entity';
import { NotificationChannel } from './enums/notification-channel.enum';
import { NotificationTemplate } from './enums/notification-template.enum';
import { NotificationsProcessingService } from './notifications-processing.service';
import { NotificationsRepository } from './notifications.repository';

export interface ScheduleNotificationInput {
  tenantId: string;
  appointmentId: string | null;
  channel: NotificationChannel;
  lang?: NotificationLanguage;
  template: NotificationTemplate;
  recipient: string;
  payload: Record<string, unknown>;
  scheduledAt: Date;
}

export interface ScheduleAppointmentNotificationsInput {
  tenantId: string;
  tenantSlug: string;
  appointmentId: string;
  recipientEmail: string;
  startsAt: Date;
}

@Injectable()
export class NotificationsService {
  public constructor(
    private readonly configService: ConfigService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsProcessingService: NotificationsProcessingService,
  ) {}

  public async scheduleNotification(
    input: ScheduleNotificationInput,
  ): Promise<NotificationJobEntity> {
    const defaultLanguage = this.configService.get<NotificationLanguage>(
      'notifications.defaultLanguage',
    );
    const lang = input.lang ?? resolveNotificationLanguage(undefined, defaultLanguage);
    const job = this.notificationsRepository.createNotificationJob({
      ...input,
      payload: {
        ...input.payload,
        lang,
      },
    });
    const savedJob = await this.notificationsRepository.saveNotificationJob(job);
    await this.notificationsProcessingService.dispatchScheduledNotification(savedJob);

    return savedJob;
  }

  public async scheduleAppointmentNotifications(
    input: ScheduleAppointmentNotificationsInput,
  ): Promise<number> {
    const now = new Date();
    const publicBookingBaseUrl =
      this.configService.get<string>('notifications.publicBookingBaseUrl') ?? '';
    const confirmUrl = `${trimTrailingSlash(publicBookingBaseUrl)}/book/appointments/${input.appointmentId}/confirm`;

    const jobs = [
      this.scheduleNotification({
        tenantId: input.tenantId,
        appointmentId: input.appointmentId,
        channel: NotificationChannel.EMAIL,
        template: NotificationTemplate.BOOKING_CREATED,
        recipient: input.recipientEmail,
        payload: {
          appointmentId: input.appointmentId,
          tenantSlug: input.tenantSlug,
          startsAtIso: input.startsAt.toISOString(),
        },
        scheduledAt: now,
      }),
    ];

    const reminder24hDate = addHours(input.startsAt, -24);
    if (reminder24hDate > now) {
      jobs.push(
        this.scheduleNotification({
          tenantId: input.tenantId,
          appointmentId: input.appointmentId,
          channel: NotificationChannel.EMAIL,
          template: NotificationTemplate.BOOKING_REMINDER_24H,
          recipient: input.recipientEmail,
          payload: {
            appointmentId: input.appointmentId,
            tenantSlug: input.tenantSlug,
            startsAtIso: input.startsAt.toISOString(),
            confirmUrl,
          },
          scheduledAt: reminder24hDate,
        }),
      );
    }

    const reminder2hDate = addHours(input.startsAt, -2);
    if (reminder2hDate > now) {
      jobs.push(
        this.scheduleNotification({
          tenantId: input.tenantId,
          appointmentId: input.appointmentId,
          channel: NotificationChannel.EMAIL,
          template: NotificationTemplate.BOOKING_REMINDER_2H,
          recipient: input.recipientEmail,
          payload: {
            appointmentId: input.appointmentId,
            tenantSlug: input.tenantSlug,
            startsAtIso: input.startsAt.toISOString(),
          },
          scheduledAt: reminder2hDate,
        }),
      );
    }

    await Promise.all(jobs);

    return jobs.length;
  }

  public async sendOtpEmail(
    tenantId: string,
    tenantSlug: string,
    recipientEmail: string,
    otp: string,
  ): Promise<void> {
    await this.scheduleNotification({
      tenantId,
      appointmentId: null,
      channel: NotificationChannel.EMAIL,
      template: NotificationTemplate.AUTH_OTP,
      recipient: recipientEmail,
      payload: {
        tenantSlug,
        otp,
      },
      scheduledAt: new Date(),
    });
  }
}

function addHours(input: Date, hours: number): Date {
  return new Date(input.getTime() + hours * 60 * 60 * 1000);
}

function trimTrailingSlash(url: string): string {
  if (!url) {
    return '';
  }

  return url.endsWith('/') ? url.slice(0, -1) : url;
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
