import { ApiProperty } from "@nestjs/swagger";

import type { ScheduleNotificationsResponseDto as ScheduleNotificationsResponseDtoContract } from "../../../contracts";

export class ScheduleNotificationsResponseDto implements ScheduleNotificationsResponseDtoContract {
  @ApiProperty({ example: true })
  public queued!: boolean;
}
