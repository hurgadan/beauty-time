import type { UpdateServiceDto as UpdateServiceDtoContract } from '@contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateServiceDto implements UpdateServiceDtoContract {
  @ApiPropertyOptional({ example: 'Haircut + Styling' })
  @IsOptional()
  @IsString()
  public name?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  public description?: string | null;

  @ApiPropertyOptional({ example: 4900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public priceCents?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(720)
  public durationMinutes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  public bufferBeforeMinutes?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  public bufferAfterMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
