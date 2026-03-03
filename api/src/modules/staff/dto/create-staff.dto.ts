import type { CreateStaffDto as CreateStaffDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { StaffRole } from '../enums/staff-role.enum';

export class CreateStaffDto implements CreateStaffDtoContract {
  @ApiProperty({ example: 'master@studio.de' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: 'Anna Muller' })
  @IsString()
  public fullName!: string;

  @ApiPropertyOptional({ enum: StaffRole, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: 'owner' | 'staff';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
