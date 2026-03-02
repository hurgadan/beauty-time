import type { StaffItemDto as StaffItemDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { StaffRole } from '../enums/staff-role.enum';

export class StaffItemDto implements StaffItemDtoContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public tenantId!: string;

  @Expose()
  @ApiProperty({ example: 'master@studio.de' })
  public email!: string;

  @Expose()
  @ApiProperty({ example: 'Anna Muller' })
  public fullName!: string;

  @Expose()
  @ApiProperty({ enum: StaffRole, example: StaffRole.STAFF })
  public role!: 'owner' | 'staff';

  @Expose()
  @ApiProperty({ example: true })
  public isActive!: boolean;
}
