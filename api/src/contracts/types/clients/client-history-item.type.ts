import type { AppointmentStatus } from "../booking";

export interface ClientHistoryItemDto {
  appointmentId: string;
  staffId: string;
  serviceId: string;
  startsAtIso: string;
  endsAtIso: string;
  status: AppointmentStatus;
  notes: string | null;
}
