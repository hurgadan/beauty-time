import type { ListTimeOffResponseDto as ListTimeOffResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { TimeOffItemDto } from "./time-off-item.dto";

export class ListTimeOffResponseDto implements ListTimeOffResponseDtoContract {
  @ApiProperty({ type: () => [TimeOffItemDto] })
  public items!: TimeOffItemDto[];
}
