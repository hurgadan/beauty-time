import type { ListStaffRequestDto as ListStaffRequestDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { StaffRole } from "../enums/staff-role.enum";

export class ListStaffQueryDto implements ListStaffRequestDtoContract {
  @ApiProperty({ required: false, example: "anna" })
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiProperty({ required: false, enum: StaffRole, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: "owner" | "staff";

  @ApiProperty({ required: false, minimum: 1, maximum: 200, example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}
