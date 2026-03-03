import type { CreatePublicAppointmentDto as CreatePublicAppointmentDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreatePublicAppointmentDto implements CreatePublicAppointmentDtoContract {
  @ApiProperty({ example: 'Anna Muller' })
  @IsString()
  public clientName!: string;

  @ApiProperty({ example: 'anna@email.de' })
  @IsEmail()
  public clientEmail!: string;

  @ApiProperty({ example: 'srv_1' })
  @IsString()
  public serviceId!: string;

  @ApiPropertyOptional({ example: 'staff_1' })
  @IsOptional()
  @IsString()
  public staffId?: string;

  @ApiProperty({ example: '2026-02-27T10:00:00+01:00' })
  @IsISO8601()
  public startsAtIso!: string;
}
