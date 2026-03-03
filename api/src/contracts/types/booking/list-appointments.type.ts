import type { AppointmentStatus } from './enums/appointment-status.enum';

export interface ListAppointmentsDto {
  staffId?: string;
  status?: AppointmentStatus;
  fromIso?: string;
  toIso?: string;
  limit?: number;
}
