import type { UpdateAppointmentDto as UpdateAppointmentDtoContract } from '@contracts';
import { AppointmentStatus } from '@contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto implements UpdateAppointmentDtoContract {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  public status?: AppointmentStatus;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Client requested quiet service',
  })
  @IsOptional()
  @IsString()
  public notes?: string | null;

  @ApiPropertyOptional({ example: '2026-03-04T09:00:00+01:00' })
  @IsOptional()
  @IsISO8601()
  public startsAtIso?: string;

  @ApiPropertyOptional({ example: '2026-03-04T10:00:00+01:00' })
  @IsOptional()
  @IsISO8601()
  public endsAtIso?: string;
}
