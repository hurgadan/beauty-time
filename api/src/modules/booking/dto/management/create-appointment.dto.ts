import type { CreateAppointmentDto as CreateAppointmentDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto implements CreateAppointmentDtoContract {
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  @IsUUID()
  public staffId!: string;

  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  @IsUUID()
  public serviceId!: string;

  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  @IsUUID()
  public clientId!: string;

  @ApiProperty({ example: '2026-03-04T09:00:00+01:00' })
  @IsISO8601()
  public startsAtIso!: string;

  @ApiProperty({ example: '2026-03-04T10:00:00+01:00' })
  @IsISO8601()
  public endsAtIso!: string;

  @ApiPropertyOptional({ example: 'Prefers short layers' })
  @IsOptional()
  @IsString()
  public notes?: string;
}
