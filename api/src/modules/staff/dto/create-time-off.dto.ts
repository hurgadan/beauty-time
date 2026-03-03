import type { CreateTimeOffDto as CreateTimeOffDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateTimeOffDto implements CreateTimeOffDtoContract {
  @ApiProperty({ example: '2026-03-04T09:00:00+01:00' })
  @IsISO8601()
  public startsAtIso!: string;

  @ApiProperty({ example: '2026-03-04T12:00:00+01:00' })
  @IsISO8601()
  public endsAtIso!: string;

  @ApiPropertyOptional({ example: 'Medical appointment' })
  @IsOptional()
  @IsString()
  public reason?: string;
}
