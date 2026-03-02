import type { AppointmentStatus } from '../booking';

export interface UpdateAppointmentRequestDto {
  status?: AppointmentStatus;
  notes?: string | null;
  startsAtIso?: string;
  endsAtIso?: string;
}
