import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AppointmentEntity } from '../../booking/dao/appointment.entity';
import { TenantEntity } from '../../tenant/dao/tenant.entity';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationJobStatus } from '../enums/notification-job-status.enum';
import { NotificationTemplate } from '../enums/notification-template.enum';

@Entity({ name: 'notification_jobs' })
@Index('idx_notification_jobs_tenant', ['tenantId'])
@Index('idx_notification_jobs_status_scheduled_at', ['status', 'scheduledAt'])
@Index('idx_notification_jobs_appointment', ['appointmentId'])
export class NotificationJobEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  public tenant!: TenantEntity;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  public appointmentId!: string | null;

  @ManyToOne(() => AppointmentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  public appointment!: AppointmentEntity | null;

  @Column({
    name: 'channel',
    type: 'varchar',
    enum: NotificationChannel,
    nullable: false,
  })
  public channel!: NotificationChannel;

  @Column({ name: 'template', type: 'varchar', nullable: false })
  public template!: NotificationTemplate;

  @Column({ name: 'recipient', type: 'varchar', nullable: false })
  public recipient!: string;

  @Column({
    name: 'payload',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'::jsonb",
  })
  public payload!: Record<string, unknown>;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: false })
  public scheduledAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  public sentAt!: Date | null;

  @Column({
    name: 'status',
    type: 'varchar',
    enum: NotificationJobStatus,
    default: NotificationJobStatus.PENDING,
    nullable: false,
  })
  public status!: NotificationJobStatus;

  @Column({ name: 'attempts', type: 'integer', default: 0, nullable: false })
  public attempts!: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  public lastError!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;
}
