import type { SendNotificationsResponseDto as SendNotificationsResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationsResponseDto implements SendNotificationsResponseDtoContract {
  @ApiProperty({ example: true })
  public sent!: boolean;
}
