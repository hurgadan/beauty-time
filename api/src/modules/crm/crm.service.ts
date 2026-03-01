import { Injectable } from "@nestjs/common";

import type {
  ListAppointmentsResponseDto,
  ListServicesResponseDto,
} from "../../contracts";
import { AppointmentStatus } from "../../contracts";

@Injectable()
export class CrmService {
  public listAppointments(tenantId: string): ListAppointmentsResponseDto {
    return {
      items: [
        {
          id: "appt_1",
          tenantId,
          status: AppointmentStatus.BOOKED,
        },
      ],
    };
  }

  public listServices(tenantId: string): ListServicesResponseDto {
    return {
      items: [
        {
          id: "srv_1",
          tenantId,
          name: "Haircut + Styling",
          durationMin: 45,
          priceEur: 49,
        },
      ],
    };
  }
}
