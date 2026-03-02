import type { UpdateAppointmentRequestDto as UpdateAppointmentRequestDtoContract } from "@contracts";
import { AppointmentStatus } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsOptional, IsString } from "class-validator";

export class UpdateAppointmentRequestDto implements UpdateAppointmentRequestDtoContract {
  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  public status?: AppointmentStatus;

  @ApiProperty({
    required: false,
    nullable: true,
    example: "Client requested quiet service",
  })
  @IsOptional()
  @IsString()
  public notes?: string | null;

  @ApiProperty({ required: false, example: "2026-03-04T09:00:00+01:00" })
  @IsOptional()
  @IsISO8601()
  public startsAtIso?: string;

  @ApiProperty({ required: false, example: "2026-03-04T10:00:00+01:00" })
  @IsOptional()
  @IsISO8601()
  public endsAtIso?: string;
}
