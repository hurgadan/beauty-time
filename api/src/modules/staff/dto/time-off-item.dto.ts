import type { TimeOffItemDto as TimeOffItemDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

export class TimeOffItemDto implements TimeOffItemDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public id!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public staffId!: string;

  @ApiProperty({ example: "2026-03-04T09:00:00.000Z" })
  public startsAtIso!: string;

  @ApiProperty({ example: "2026-03-04T12:00:00.000Z" })
  public endsAtIso!: string;

  @ApiProperty({ nullable: true, example: "Medical appointment" })
  public reason!: string | null;
}
