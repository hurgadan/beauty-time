import type {
  AppointmentListItemDto,
  CreateAppointmentRequestDto,
  ListAppointmentsRequestDto,
  ListAppointmentsResponseDto,
  UpdateAppointmentRequestDto,
} from "@contracts";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { BookingAppointmentsRepository } from "./booking-appointments.repository";
import { AppointmentEntity } from "./dao/appointment.entity";

@Injectable()
export class BookingAppointmentsService {
  public constructor(
    private readonly bookingAppointmentsRepository: BookingAppointmentsRepository,
  ) {}

  public async listAppointments(
    tenantId: string,
    query: ListAppointmentsRequestDto = {},
  ): Promise<ListAppointmentsResponseDto> {
    const items = await this.bookingAppointmentsRepository.findAppointments(
      tenantId,
      query,
    );

    return {
      items: items.map((appointment) => this.mapAppointment(appointment)),
    };
  }

  public async createAppointment(
    tenantId: string,
    payload: CreateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    const startsAt = new Date(payload.startsAtIso);
    const endsAt = new Date(payload.endsAtIso);

    if (startsAt >= endsAt) {
      throw new BadRequestException("Appointment start must be before end");
    }

    await this.ensureStaff(tenantId, payload.staffId);
    await this.ensureService(tenantId, payload.serviceId);
    await this.ensureClient(tenantId, payload.clientId);

    const overlap =
      await this.bookingAppointmentsRepository.hasAppointmentOverlap(
        tenantId,
        payload.staffId,
        startsAt,
        endsAt,
      );

    if (overlap) {
      throw new ConflictException("Staff already has appointment in this slot");
    }

    const appointment = this.bookingAppointmentsRepository.createAppointment(
      tenantId,
      payload,
      startsAt,
      endsAt,
    );

    const saved =
      await this.bookingAppointmentsRepository.saveAppointment(appointment);

    return this.mapAppointment(saved);
  }

  public async updateAppointment(
    tenantId: string,
    appointmentId: string,
    payload: UpdateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    const appointment =
      await this.bookingAppointmentsRepository.findAppointmentById(
        tenantId,
        appointmentId,
      );

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    if (
      (payload.startsAtIso && !payload.endsAtIso) ||
      (!payload.startsAtIso && payload.endsAtIso)
    ) {
      throw new BadRequestException(
        "startsAtIso and endsAtIso must be provided together",
      );
    }

    if (payload.startsAtIso && payload.endsAtIso) {
      const startsAt = new Date(payload.startsAtIso);
      const endsAt = new Date(payload.endsAtIso);

      if (startsAt >= endsAt) {
        throw new BadRequestException("Appointment start must be before end");
      }

      appointment.startsAt = startsAt;
      appointment.endsAt = endsAt;
    }

    if (payload.status !== undefined) {
      appointment.status = payload.status;
    }

    if (payload.notes !== undefined) {
      appointment.notes = payload.notes;
    }

    const saved =
      await this.bookingAppointmentsRepository.saveAppointment(appointment);

    return this.mapAppointment(saved);
  }

  private async ensureStaff(tenantId: string, staffId: string): Promise<void> {
    const staff = await this.bookingAppointmentsRepository.findStaffById(
      tenantId,
      staffId,
    );

    if (!staff) {
      throw new NotFoundException("Staff not found");
    }
  }

  private async ensureService(
    tenantId: string,
    serviceId: string,
  ): Promise<void> {
    const service = await this.bookingAppointmentsRepository.findServiceById(
      tenantId,
      serviceId,
    );

    if (!service) {
      throw new NotFoundException("Service not found");
    }
  }

  private async ensureClient(
    tenantId: string,
    clientId: string,
  ): Promise<void> {
    const client = await this.bookingAppointmentsRepository.findClientById(
      tenantId,
      clientId,
    );

    if (!client) {
      throw new NotFoundException("Client not found");
    }
  }

  private mapAppointment(
    appointment: AppointmentEntity,
  ): AppointmentListItemDto {
    return {
      id: appointment.id,
      tenantId: appointment.tenantId,
      staffId: appointment.staffId,
      serviceId: appointment.serviceId,
      clientId: appointment.clientId,
      startsAtIso: appointment.startsAt.toISOString(),
      endsAtIso: appointment.endsAt.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
    };
  }
}
