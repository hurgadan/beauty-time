import type { WorkingHoursItemDto as WorkingHoursItemDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

export class WorkingHoursItemDto implements WorkingHoursItemDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public id!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public staffId!: string;

  @ApiProperty({ example: 1 })
  public dayOfWeek!: number;

  @ApiProperty({ example: "09:00:00" })
  public startTime!: string;

  @ApiProperty({ example: "17:00:00" })
  public endTime!: string;
}
