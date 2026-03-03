import type { CreateServiceDto as CreateServiceDtoContract } from '@contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateServiceDto implements CreateServiceDtoContract {
  @ApiProperty({ example: 'Haircut + Styling' })
  @IsString()
  public name!: string;

  @ApiPropertyOptional({ example: 'Wash, haircut and styling' })
  @IsOptional()
  @IsString()
  public description?: string;

  @ApiProperty({ example: 4900 })
  @IsInt()
  @Min(0)
  public priceCents!: number;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(5)
  @Max(720)
  public durationMinutes!: number;

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
