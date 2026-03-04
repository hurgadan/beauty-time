import type { PublicBookingServiceDto as PublicBookingServiceDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class PublicBookingServiceResponseDto implements PublicBookingServiceDtoContract {
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abc101' })
  public id!: string;

  @ApiProperty({ example: 'Haircut + Styling' })
  public name!: string;

  @ApiProperty({ example: 45 })
  public durationMinutes!: number;

  @ApiProperty({ example: 4900 })
  public priceCents!: number;
}
