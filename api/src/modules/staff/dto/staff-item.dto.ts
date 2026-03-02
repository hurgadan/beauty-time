import type { StaffItemDto as StaffItemDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { StaffRole } from "../enums/staff-role.enum";

export class StaffItemDto implements StaffItemDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public id!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public tenantId!: string;

  @ApiProperty({ example: "master@studio.de" })
  public email!: string;

  @ApiProperty({ example: "Anna Muller" })
  public fullName!: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.STAFF })
  public role!: "owner" | "staff";

  @ApiProperty({ example: true })
  public isActive!: boolean;
}
