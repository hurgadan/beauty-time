import type { ScheduleNotificationsResponseDto as ScheduleNotificationsResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleNotificationsResponseDto implements ScheduleNotificationsResponseDtoContract {
  @ApiProperty({ example: true })
  public queued!: boolean;
}
