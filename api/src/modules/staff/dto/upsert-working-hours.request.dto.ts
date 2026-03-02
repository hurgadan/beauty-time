import type {
  UpsertWorkingHoursEntryDto as UpsertWorkingHoursEntryDtoContract,
  UpsertWorkingHoursRequestDto as UpsertWorkingHoursRequestDtoContract,
} from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class UpsertWorkingHoursEntryDto implements UpsertWorkingHoursEntryDtoContract {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  public dayOfWeek!: number;

  @ApiProperty({ example: "09:00:00" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  public startTime!: string;

  @ApiProperty({ example: "17:00:00" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  public endTime!: string;
}

export class UpsertWorkingHoursRequestDto implements UpsertWorkingHoursRequestDtoContract {
  @ApiProperty({ type: () => [UpsertWorkingHoursEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpsertWorkingHoursEntryDto)
  public items!: UpsertWorkingHoursEntryDto[];
}
