import { ApiProperty } from '@nestjs/swagger';
import type { StaffLoginResponseDto as StaffLoginResponseDtoContract } from '../../../contracts';

export class StaffLoginResponseDto implements StaffLoginResponseDtoContract {
  @ApiProperty({ example: 'jwt-token' })
  public accessToken!: string;
}
