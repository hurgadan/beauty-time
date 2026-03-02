import type { UpdateStaffRequestDto as UpdateStaffRequestDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

import { StaffRole } from "../enums/staff-role.enum";

export class UpdateStaffRequestDto implements UpdateStaffRequestDtoContract {
  @ApiProperty({ required: false, example: "master@studio.de" })
  @IsOptional()
  @IsEmail()
  public email?: string;

  @ApiProperty({ required: false, example: "Anna Muller" })
  @IsOptional()
  @IsString()
  public fullName?: string;

  @ApiProperty({ enum: StaffRole, required: false, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: "owner" | "staff";

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
