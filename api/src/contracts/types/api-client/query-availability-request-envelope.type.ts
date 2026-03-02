import type { AvailabilityQueryRequestDto } from '../booking';

export interface QueryAvailabilityRequestEnvelopeDto {
  bookingSlug: string;
  payload: AvailabilityQueryRequestDto;
}
