import { ApiProperty } from "@nestjs/swagger";

import type { SendNotificationsResponseDto as SendNotificationsResponseDtoContract } from "../../../contracts";

export class SendNotificationsResponseDto implements SendNotificationsResponseDtoContract {
  @ApiProperty({ example: true })
  public sent!: boolean;
}
