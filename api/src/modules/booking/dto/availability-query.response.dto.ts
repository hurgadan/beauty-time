import { ApiProperty } from '@nestjs/swagger';
import type { AvailabilityQueryResponseDto as AvailabilityQueryResponseDtoContract } from '../../../contracts';
import { AvailabilitySlotResponseDto } from './availability-slot.response.dto';

export class AvailabilityQueryResponseDto implements AvailabilityQueryResponseDtoContract {
  @ApiProperty({ example: 'studio-berlin-mitte' })
  public bookingSlug!: string;

  @ApiProperty({ type: () => [AvailabilitySlotResponseDto] })
  public slots!: AvailabilitySlotResponseDto[];
}
