import { Injectable } from "@nestjs/common";

import type {
  AvailabilitySlotDto,
  BookingConfigResponseDto,
  ConfirmAppointmentResponseDto,
  CreatePublicAppointmentResponseDto,
} from "../../contracts";
import { AppointmentStatus } from "../../contracts";

@Injectable()
export class BookingService {
  public getConfig(bookingSlug: string): BookingConfigResponseDto {
    return {
      bookingSlug,
      timezone: "Europe/Berlin",
      reminderChannels: ["email"],
    };
  }

  public listAvailability(): AvailabilitySlotDto[] {
    return [
      { startsAtIso: "2026-02-27T09:00:00+01:00", available: true },
      { startsAtIso: "2026-02-27T09:30:00+01:00", available: true },
      { startsAtIso: "2026-02-27T10:00:00+01:00", available: false },
    ];
  }

  public createPublicAppointment(
    bookingSlug: string,
  ): CreatePublicAppointmentResponseDto {
    return { id: "appt_public_1", bookingSlug };
  }

  public confirmAppointment(id: string): ConfirmAppointmentResponseDto {
    return { id, status: AppointmentStatus.CONFIRMED_BY_REMINDER };
  }
}
