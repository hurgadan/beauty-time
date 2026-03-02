import type { ListAppointmentsResponseDto as ListAppointmentsResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { AppointmentListItemDto } from "./appointment-list-item.dto";

export class ListAppointmentsResponseDto implements ListAppointmentsResponseDtoContract {
  @ApiProperty({ type: () => [AppointmentListItemDto] })
  public items!: AppointmentListItemDto[];
}
