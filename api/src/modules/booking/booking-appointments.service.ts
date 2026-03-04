import type { CreateAppointmentDto, ListAppointmentsDto, UpdateAppointmentDto } from '@contracts';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BookingAppointmentsRepository } from './booking-appointments.repository';
import { AppointmentEntity } from './dao/appointment.entity';
import { ClientsService } from '../clients/clients.service';
import { ClientEntity } from '../clients/dao/client.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ServicesService } from '../services/services.service';
import { StaffService } from '../staff/staff.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class BookingAppointmentsService {
  public constructor(
    private readonly bookingAppointmentsRepository: BookingAppointmentsRepository,
    private readonly staffService: StaffService,
    private readonly servicesService: ServicesService,
    private readonly clientsService: ClientsService,
    private readonly notificationsService: NotificationsService,
    private readonly tenantService: TenantService,
  ) {}

  public async listAppointments(
    tenantId: string,
    query: ListAppointmentsDto = {},
  ): Promise<AppointmentEntity[]> {
    return this.bookingAppointmentsRepository.findAppointments(tenantId, query);
  }

  public async createAppointment(
    tenantId: string,
    payload: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const startsAt = new Date(payload.startsAtIso);
    const endsAt = new Date(payload.endsAtIso);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Appointment start must be before end');
    }

    await this.ensureStaff(tenantId, payload.staffId);
    await this.ensureService(tenantId, payload.serviceId);
    const client = await this.ensureClient(tenantId, payload.clientId);

    const overlap = await this.bookingAppointmentsRepository.hasAppointmentOverlap(
      tenantId,
      payload.staffId,
      startsAt,
      endsAt,
    );

    if (overlap) {
      throw new ConflictException('Staff already has appointment in this slot');
    }

    const appointment = this.bookingAppointmentsRepository.createAppointment(
      tenantId,
      payload,
      startsAt,
      endsAt,
    );

    const saved = await this.bookingAppointmentsRepository.saveAppointment(appointment);
    const tenant = await this.tenantService.getByIdOrThrow(tenantId);

    await this.notificationsService.scheduleAppointmentNotifications({
      tenantId,
      tenantSlug: tenant.slug,
      appointmentId: saved.id,
      recipientEmail: client.email,
      startsAt: saved.startsAt,
    });

    return saved;
  }

  public async updateAppointment(
    tenantId: string,
    appointmentId: string,
    payload: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const appointment = await this.bookingAppointmentsRepository.findAppointmentById(
      tenantId,
      appointmentId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      (payload.startsAtIso && !payload.endsAtIso) ||
      (!payload.startsAtIso && payload.endsAtIso)
    ) {
      throw new BadRequestException('startsAtIso and endsAtIso must be provided together');
    }

    if (payload.startsAtIso && payload.endsAtIso) {
      const startsAt = new Date(payload.startsAtIso);
      const endsAt = new Date(payload.endsAtIso);

      if (startsAt >= endsAt) {
        throw new BadRequestException('Appointment start must be before end');
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

    return this.bookingAppointmentsRepository.saveAppointment(appointment);
  }

  private async ensureStaff(tenantId: string, staffId: string): Promise<void> {
    const staff = await this.staffService.findActiveStaffById(tenantId, staffId);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
  }

  private async ensureService(tenantId: string, serviceId: string): Promise<void> {
    const service = await this.servicesService.findActiveServiceById(tenantId, serviceId);

    if (!service) {
      throw new NotFoundException('Service not found');
    }
  }

  private async ensureClient(tenantId: string, clientId: string): Promise<ClientEntity> {
    const client = await this.clientsService.getClientOptional(tenantId, clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }
}
