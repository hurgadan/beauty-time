import type { CreatePublicAppointmentRequestDto } from "../booking/create-public-appointment-request.type";

export interface CreatePublicAppointmentRequestEnvelopeDto {
  bookingSlug: string;
  payload: CreatePublicAppointmentRequestDto;
}
