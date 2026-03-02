import type { AppointmentStatus } from './enums';

export interface ConfirmAppointmentResponseDto {
  id: string;
  status: AppointmentStatus;
}
