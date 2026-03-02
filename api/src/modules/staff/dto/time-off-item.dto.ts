import type { TimeOffItemDto as TimeOffItemDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TimeOffItemDto implements TimeOffItemDtoContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public staffId!: string;

  @Expose()
  @ApiProperty({ example: '2026-03-04T09:00:00.000Z' })
  public startsAtIso!: string;

  @Expose()
  @ApiProperty({ example: '2026-03-04T12:00:00.000Z' })
  public endsAtIso!: string;

  @Expose()
  @ApiProperty({ nullable: true, example: 'Medical appointment' })
  public reason!: string | null;
}
