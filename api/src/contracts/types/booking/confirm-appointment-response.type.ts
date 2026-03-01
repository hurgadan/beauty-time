import type { AppointmentStatus } from "./enums/appointment-status.enum";

export interface ConfirmAppointmentResponseDto {
  id: string;
  status: AppointmentStatus;
}
