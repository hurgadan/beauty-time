import type { ListAppointmentsRequestDto as ListAppointmentsRequestDtoContract } from '@contracts';
import { AppointmentStatus } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListAppointmentsQueryDto implements ListAppointmentsRequestDtoContract {
  @ApiProperty({
    required: false,
    example: 'a1234567-89ab-7def-8123-456789abcdef',
  })
  @IsOptional()
  @IsUUID()
  public staffId?: string;

  @ApiProperty({
    required: false,
    enum: AppointmentStatus,
    example: AppointmentStatus.BOOKED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  public status?: AppointmentStatus;

  @ApiProperty({ required: false, example: '2026-03-01T00:00:00+01:00' })
  @IsOptional()
  @IsISO8601()
  public fromIso?: string;

  @ApiProperty({ required: false, example: '2026-03-31T23:59:59+02:00' })
  @IsOptional()
  @IsISO8601()
  public toIso?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 200, example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}
