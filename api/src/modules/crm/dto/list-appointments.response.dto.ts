import { ApiProperty } from '@nestjs/swagger';
import type { ListAppointmentsResponseDto as ListAppointmentsResponseDtoContract } from '../../../contracts';
import { AppointmentListItemDto } from './appointment-list-item.dto';

export class ListAppointmentsResponseDto implements ListAppointmentsResponseDtoContract {
  @ApiProperty({ type: () => [AppointmentListItemDto] })
  public items!: AppointmentListItemDto[];
}
