import type { AvailabilityQueryDto as AvailabilityQueryDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class AvailabilityQueryDto implements AvailabilityQueryDtoContract {
  @ApiProperty({ example: 'srv_1' })
  @IsString()
  public serviceId!: string;

  @ApiPropertyOptional({ example: 'staff_1' })
  @IsOptional()
  @IsString()
  public staffId?: string;

  @ApiProperty({ example: '2026-02-27' })
  @IsISO8601()
  public dateIso!: string;
}
