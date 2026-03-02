import type { AppointmentStatus } from "../booking";

export interface ListAppointmentsRequestDto {
  staffId?: string;
  status?: AppointmentStatus;
  fromIso?: string;
  toIso?: string;
  limit?: number;
}
