import type { AppointmentStatus } from '@contracts/types';

export interface ListAppointmentsDto {
  staffId?: string;
  status?: AppointmentStatus;
  fromIso?: string;
  toIso?: string;
  limit?: number;
}
