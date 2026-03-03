import type { AppointmentStatus } from './enums/appointment-status.enum';

export interface AppointmentDto {
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
