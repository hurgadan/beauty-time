import type { AppointmentListItemDto as AppointmentListItemDtoContract } from '@contracts';
import { AppointmentStatus } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AppointmentListItemDto implements AppointmentListItemDtoContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public tenantId!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public staffId!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public serviceId!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public clientId!: string;

  @Expose()
  @ApiProperty({ example: '2026-03-04T09:00:00.000Z' })
  public startsAtIso!: string;

  @Expose()
  @ApiProperty({ example: '2026-03-04T10:00:00.000Z' })
  public endsAtIso!: string;

  @Expose()
  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.BOOKED })
  public status!: AppointmentStatus;

  @Expose()
  @ApiProperty({ nullable: true, example: 'Client requested quiet service' })
  public notes!: string | null;
}
