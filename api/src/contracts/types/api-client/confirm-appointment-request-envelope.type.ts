import type { ConfirmAppointmentRequestDto } from '../booking/confirm-appointment-request.type';

export interface ConfirmAppointmentRequestEnvelopeDto {
  payload: ConfirmAppointmentRequestDto;
}
