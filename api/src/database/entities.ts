import { OtpSessionEntity } from '../modules/auth/dao/otp-session.entity';
import { AppointmentEntity } from '../modules/booking/dao/appointment.entity';
import { ClientEntity } from '../modules/clients/dao/client.entity';
import { ServiceEntity } from '../modules/crm/dao/service.entity';
import { StaffEntity } from '../modules/crm/dao/staff.entity';
import { TimeOffEntity } from '../modules/crm/dao/time-off.entity';
import { WorkingHoursEntity } from '../modules/crm/dao/working-hours.entity';
import { NotificationJobEntity } from '../modules/notifications/dao/notification-job.entity';
import { TenantEntity } from '../modules/tenant/dao/tenant.entity';

export const DB_ENTITIES = [
  TenantEntity,
  StaffEntity,
  ServiceEntity,
  WorkingHoursEntity,
  TimeOffEntity,
  ClientEntity,
  AppointmentEntity,
  OtpSessionEntity,
  NotificationJobEntity,
] as const;
