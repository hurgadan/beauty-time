import type { ListStaffDto as ListStaffDtoContract } from '@contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { StaffRole } from '../enums/staff-role.enum';

export class ListStaffQueryDto implements ListStaffDtoContract {
  @ApiPropertyOptional({ example: 'anna' })
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiPropertyOptional({ enum: StaffRole, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  public role?: 'owner' | 'staff';

  @ApiPropertyOptional({ minimum: 1, maximum: 200, example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}
