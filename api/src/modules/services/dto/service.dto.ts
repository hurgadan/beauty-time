import type { Service as ServiceContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ServiceDto implements ServiceContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public tenantId!: string;

  @Expose()
  @ApiProperty({ example: 'Haircut + Styling' })
  public name!: string;

  @Expose()
  @ApiProperty({ nullable: true, example: 'Wash, haircut and styling' })
  public description!: string | null;

  @Expose()
  @ApiProperty({ example: 4900 })
  public priceCents!: number;

  @Expose()
  @ApiProperty({ example: 45 })
  public durationMinutes!: number;

  @Expose()
  @ApiProperty({ example: 5 })
  public bufferBeforeMinutes!: number;

  @Expose()
  @ApiProperty({ example: 10 })
  public bufferAfterMinutes!: number;

  @Expose()
  @ApiProperty({ example: true })
  public isActive!: boolean;
}
