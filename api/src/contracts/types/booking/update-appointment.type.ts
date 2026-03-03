import type { AppointmentStatus } from './enums/appointment-status.enum';

export interface UpdateAppointmentDto {
  status?: AppointmentStatus;
  notes?: string | null;
  startsAtIso?: string;
  endsAtIso?: string;
}
