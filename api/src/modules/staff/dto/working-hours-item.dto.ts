import type { WorkingHoursItemDto as WorkingHoursItemDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkingHoursItemDto implements WorkingHoursItemDtoContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public staffId!: string;

  @Expose()
  @ApiProperty({ example: 1 })
  public dayOfWeek!: number;

  @Expose()
  @ApiProperty({ example: '09:00:00' })
  public startTime!: string;

  @Expose()
  @ApiProperty({ example: '17:00:00' })
  public endTime!: string;
}
