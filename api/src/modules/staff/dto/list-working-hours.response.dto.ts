import type { ListWorkingHoursResponseDto as ListWorkingHoursResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { WorkingHoursItemDto } from "./working-hours-item.dto";

export class ListWorkingHoursResponseDto implements ListWorkingHoursResponseDtoContract {
  @ApiProperty({ type: () => [WorkingHoursItemDto] })
  public items!: WorkingHoursItemDto[];
}
