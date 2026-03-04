import type { SendNotificationsResponseDto as SendNotificationsResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationsResponseDto implements SendNotificationsResponseDtoContract {
  @ApiProperty({ example: true })
  public sent!: boolean;

  @ApiProperty({ example: 3 })
  public processed!: number;

  @ApiProperty({ example: 0 })
  public failed!: number;
}
