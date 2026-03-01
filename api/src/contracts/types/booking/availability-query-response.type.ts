import type { AvailabilitySlotDto } from "./availability-slot.type";

export interface AvailabilityQueryResponseDto {
  bookingSlug: string;
  slots: AvailabilitySlotDto[];
}
