import type { ServiceResponseDto as ServiceResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

export class ServiceResponseDto implements ServiceResponseDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public id!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public tenantId!: string;

  @ApiProperty({ example: "Haircut + Styling" })
  public name!: string;

  @ApiProperty({ nullable: true, example: "Wash, haircut and styling" })
  public description!: string | null;

  @ApiProperty({ example: 4900 })
  public priceCents!: number;

  @ApiProperty({ example: 45 })
  public durationMinutes!: number;

  @ApiProperty({ example: 5 })
  public bufferBeforeMinutes!: number;

  @ApiProperty({ example: 10 })
  public bufferAfterMinutes!: number;

  @ApiProperty({ example: true })
  public isActive!: boolean;
}
