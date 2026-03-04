import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import { NotificationJobEntity } from './dao/notification-job.entity';
import { NotificationChannel } from './enums/notification-channel.enum';
import { NotificationJobStatus } from './enums/notification-job-status.enum';
import { NotificationTemplate } from './enums/notification-template.enum';

export interface CreateNotificationJobInput {
  tenantId: string;
  appointmentId: string | null;
  channel: NotificationChannel;
  template: NotificationTemplate;
  recipient: string;
  payload: Record<string, unknown>;
  scheduledAt: Date;
}

@Injectable()
export class NotificationsRepository {
  public constructor(
    @InjectRepository(NotificationJobEntity)
    private readonly notificationJobRepository: Repository<NotificationJobEntity>,
  ) {}

  public createNotificationJob(input: CreateNotificationJobInput): NotificationJobEntity {
    return this.notificationJobRepository.create({
      tenantId: input.tenantId,
      appointmentId: input.appointmentId,
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      payload: input.payload,
      scheduledAt: input.scheduledAt,
      sentAt: null,
      status: NotificationJobStatus.PENDING,
      attempts: 0,
      lastError: null,
    });
  }

  public async saveNotificationJob(job: NotificationJobEntity): Promise<NotificationJobEntity> {
    return this.notificationJobRepository.save(job);
  }

  public async findNotificationJobById(jobId: string): Promise<NotificationJobEntity | null> {
    return this.notificationJobRepository.findOneBy({ id: jobId });
  }

  public async findDuePendingJobs(now: Date, limit: number): Promise<NotificationJobEntity[]> {
    return this.notificationJobRepository.find({
      where: {
        status: NotificationJobStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
      order: { scheduledAt: 'ASC' },
      take: limit,
    });
  }

  public async findPendingJobs(limit: number): Promise<NotificationJobEntity[]> {
    return this.notificationJobRepository.find({
      where: { status: NotificationJobStatus.PENDING },
      order: { scheduledAt: 'ASC' },
      take: limit,
    });
  }
}
