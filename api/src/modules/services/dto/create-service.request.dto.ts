import type { CreateServiceRequestDto as CreateServiceRequestDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateServiceRequestDto implements CreateServiceRequestDtoContract {
  @ApiProperty({ example: "Haircut + Styling" })
  @IsString()
  public name!: string;

  @ApiProperty({ required: false, example: "Wash, haircut and styling" })
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
