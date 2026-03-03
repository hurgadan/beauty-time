import type { AvailabilitySlotDto } from './availability-slot.type';

export interface AvailabilityQueryResponseDto {
  tenantSlug: string;
  slots: AvailabilitySlotDto[];
}
