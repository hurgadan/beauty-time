import type { AppointmentStatus } from '../booking';

export interface AppointmentListItemDto {
  id: string;
  tenantId: string;
  staffId: string;
  serviceId: string;
  clientId: string;
  startsAtIso: string;
  endsAtIso: string;
  status: AppointmentStatus;
  notes: string | null;
}
