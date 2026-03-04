import type { PublicBookingStaffDto as PublicBookingStaffDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class PublicBookingStaffResponseDto implements PublicBookingStaffDtoContract {
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abc011' })
  public id!: string;

  @ApiProperty({ example: 'Anna Vogel' })
  public fullName!: string;

  @ApiProperty({ enum: ['owner', 'staff'], example: 'staff' })
  public role!: 'owner' | 'staff';
}
