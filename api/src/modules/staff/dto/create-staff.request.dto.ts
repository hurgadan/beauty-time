import type { CreateStaffRequestDto as CreateStaffRequestDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

import { StaffRole } from "../enums/staff-role.enum";

export class CreateStaffRequestDto implements CreateStaffRequestDtoContract {
  @ApiProperty({ example: "master@studio.de" })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: "Anna Muller" })
  @IsString()
  public fullName!: string;

  @ApiProperty({ enum: StaffRole, required: false, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: "owner" | "staff";

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
