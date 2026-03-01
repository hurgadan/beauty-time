import { ApiProperty } from '@nestjs/swagger';
import type { AppointmentListItemDto as AppointmentListItemDtoContract } from '../../../contracts';
import { AppointmentStatus } from '../../../contracts';

export class AppointmentListItemDto implements AppointmentListItemDtoContract {
  @ApiProperty({ example: 'appt_1' })
  public id!: string;

  @ApiProperty({ example: 'tenant_1' })
  public tenantId!: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.BOOKED })
  public status!: AppointmentStatus;
}
