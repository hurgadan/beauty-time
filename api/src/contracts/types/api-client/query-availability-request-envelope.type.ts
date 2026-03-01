import type { AvailabilityQueryRequestDto } from "../booking/availability-query-request.type";

export interface QueryAvailabilityRequestEnvelopeDto {
  bookingSlug: string;
  payload: AvailabilityQueryRequestDto;
}
