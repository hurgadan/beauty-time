import type { AppointmentStatus } from '../booking/enums/appointment-status.enum';

export interface AppointmentListItemDto {
  id: string;
  tenantId: string;
  status: AppointmentStatus;
}
