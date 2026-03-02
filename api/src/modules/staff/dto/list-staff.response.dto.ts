import type { ListStaffResponseDto as ListStaffResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { StaffItemDto } from "./staff-item.dto";

export class ListStaffResponseDto implements ListStaffResponseDtoContract {
  @ApiProperty({ type: () => [StaffItemDto] })
  public items!: StaffItemDto[];
}
