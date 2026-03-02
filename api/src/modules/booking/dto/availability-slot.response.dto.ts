import type { AvailabilitySlotDto as AvailabilitySlotDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotResponseDto implements AvailabilitySlotDtoContract {
  @ApiProperty({ example: '2026-02-27T09:00:00+01:00' })
  public startsAtIso!: string;

  @ApiProperty({ example: true })
  public available!: boolean;
}
