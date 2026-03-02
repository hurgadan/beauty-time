import type { UpdateServiceRequestDto as UpdateServiceRequestDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateServiceRequestDto implements UpdateServiceRequestDtoContract {
  @ApiProperty({ required: false, example: 'Haircut + Styling' })
  @IsOptional()
  @IsString()
  public name?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  public description?: string | null;

  @ApiProperty({ required: false, example: 4900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public priceCents?: number;

  @ApiProperty({ required: false, example: 45 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(720)
  public durationMinutes?: number;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  public bufferBeforeMinutes?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  public bufferAfterMinutes?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
