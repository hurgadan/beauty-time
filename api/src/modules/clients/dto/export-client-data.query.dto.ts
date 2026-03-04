import type { ExportClientDataDto as ExportClientDataDtoContract } from '@contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ExportClientDataQueryDto implements ExportClientDataDtoContract {
  @ApiPropertyOptional({
    example: 100,
    description: 'Max appointments included in export',
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  public limit?: number;
}
