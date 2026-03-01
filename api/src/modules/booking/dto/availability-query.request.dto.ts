import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601, IsOptional, IsString } from "class-validator";

import type { AvailabilityQueryRequestDto as AvailabilityQueryRequestDtoContract } from "../../../contracts";

export class AvailabilityQueryRequestDto implements AvailabilityQueryRequestDtoContract {
  @ApiProperty({ example: "srv_1" })
  @IsString()
  public serviceId!: string;

  @ApiProperty({ required: false, example: "staff_1" })
  @IsOptional()
  @IsString()
  public staffId?: string;

  @ApiProperty({ example: "2026-02-27" })
  @IsISO8601()
  public dateIso!: string;
}
