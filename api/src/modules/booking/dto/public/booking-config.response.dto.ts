import type { BookingConfigResponseDto as BookingConfigResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class BookingConfigResponseDto implements BookingConfigResponseDtoContract {
  @ApiProperty({ example: 'studio-berlin-mitte' })
  public tenantSlug!: string;

  @ApiProperty({ example: 'Europe/Berlin' })
  public timezone!: string;

  @ApiProperty({ type: () => [String], example: ['email'] })
  public reminderChannels!: string[];
}
