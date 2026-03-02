import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListClientsQueryDto {
  @ApiProperty({ required: false, example: "sofia" })
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiProperty({ required: false, example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  public limit?: number;
}
