import type { UpdateStaffDto as UpdateStaffDtoContract } from '@contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { StaffRole } from '../enums/staff-role.enum';

export class UpdateStaffDto implements UpdateStaffDtoContract {
  @ApiPropertyOptional({ example: 'master@studio.de' })
  @IsOptional()
  @IsEmail()
  public email?: string;

  @ApiPropertyOptional({ example: 'Anna Muller' })
  @IsOptional()
  @IsString()
  public fullName?: string;

  @ApiPropertyOptional({ enum: StaffRole, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: 'owner' | 'staff';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
