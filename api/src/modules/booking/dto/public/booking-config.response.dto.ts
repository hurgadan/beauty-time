import type { BookingConfigResponseDto as BookingConfigResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

import { PublicBookingServiceResponseDto } from './public-booking-service.response.dto';
import { PublicBookingStaffResponseDto } from './public-booking-staff.response.dto';

export class BookingConfigResponseDto implements BookingConfigResponseDtoContract {
  @ApiProperty({ example: 'studio-berlin-mitte' })
  public tenantSlug!: string;

  @ApiProperty({ example: 'Europe/Berlin' })
  public timezone!: string;

  @ApiProperty({ type: () => [String], example: ['email'] })
  public reminderChannels!: string[];

  @ApiProperty({ type: () => [PublicBookingServiceResponseDto] })
  public services!: PublicBookingServiceResponseDto[];

  @ApiProperty({ type: () => [PublicBookingStaffResponseDto] })
  public staff!: PublicBookingStaffResponseDto[];
}
