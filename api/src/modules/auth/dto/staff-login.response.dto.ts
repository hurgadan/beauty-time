import type { StaffLoginResponseDto as StaffLoginResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class StaffLoginResponseDto implements StaffLoginResponseDtoContract {
  @ApiProperty({ example: 'jwt-token' })
  public accessToken!: string;
}
