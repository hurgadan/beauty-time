import type { CreatePublicAppointmentRequestDto } from '../booking';

export interface CreatePublicAppointmentRequestEnvelopeDto {
  bookingSlug: string;
  payload: CreatePublicAppointmentRequestDto;
}
