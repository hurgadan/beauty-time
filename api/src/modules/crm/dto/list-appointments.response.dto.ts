import { ApiProperty } from "@nestjs/swagger";

import { AppointmentListItemDto } from "./appointment-list-item.dto";
import type { ListAppointmentsResponseDto as ListAppointmentsResponseDtoContract } from "../../../contracts";

export class ListAppointmentsResponseDto implements ListAppointmentsResponseDtoContract {
  @ApiProperty({ type: () => [AppointmentListItemDto] })
  public items!: AppointmentListItemDto[];
}
