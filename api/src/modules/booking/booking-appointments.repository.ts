import type {
  CreateAppointmentRequestDto,
  ListAppointmentsRequestDto,
} from "@contracts";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  type FindOperator,
  type FindOptionsWhere,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from "typeorm";

import { AppointmentEntity } from "./dao/appointment.entity";
import { ClientEntity } from "../clients/dao/client.entity";
import { ServiceEntity } from "../services/dao/service.entity";
import { StaffEntity } from "../staff/dao/staff.entity";

@Injectable()
export class BookingAppointmentsRepository {
  public constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  public async findAppointments(
    tenantId: string,
    query: ListAppointmentsRequestDto = {},
  ): Promise<AppointmentEntity[]> {
    const limit = query.limit ?? 200;
    const startsAtFilter = this.buildStartsAtFilter(query);
    const where: FindOptionsWhere<AppointmentEntity> = {
      tenantId,
      ...(query.staffId ? { staffId: query.staffId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(startsAtFilter ? { startsAt: startsAtFilter } : {}),
    };

    return this.appointmentRepository.find({
      where,
      order: { startsAt: "DESC" },
      take: limit,
    });
  }

  public async findAppointmentById(
    tenantId: string,
    appointmentId: string,
  ): Promise<AppointmentEntity | null> {
    return this.appointmentRepository.findOneBy({
      id: appointmentId,
      tenantId,
    });
  }

  public createAppointment(
    tenantId: string,
    payload: CreateAppointmentRequestDto,
    startsAt: Date,
    endsAt: Date,
  ): AppointmentEntity {
    return this.appointmentRepository.create({
      tenantId,
      staffId: payload.staffId,
      serviceId: payload.serviceId,
      clientId: payload.clientId,
      startsAt,
      endsAt,
      notes: payload.notes ?? null,
    });
  }

  public async saveAppointment(
    appointment: AppointmentEntity,
  ): Promise<AppointmentEntity> {
    return this.appointmentRepository.save(appointment);
  }

  public async hasAppointmentOverlap(
    tenantId: string,
    staffId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<boolean> {
    const overlap = await this.appointmentRepository.findOne({
      where: {
        tenantId,
        staffId,
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
      },
      select: { id: true },
    });

    return overlap !== null;
  }

  public async findStaffById(
    tenantId: string,
    staffId: string,
  ): Promise<StaffEntity | null> {
    return this.staffRepository.findOneBy({ id: staffId, tenantId });
  }

  public async findServiceById(
    tenantId: string,
    serviceId: string,
  ): Promise<ServiceEntity | null> {
    return this.serviceRepository.findOneBy({ id: serviceId, tenantId });
  }

  public async findClientById(
    tenantId: string,
    clientId: string,
  ): Promise<ClientEntity | null> {
    return this.clientRepository.findOneBy({ id: clientId, tenantId });
  }

  private buildStartsAtFilter(
    query: ListAppointmentsRequestDto,
  ): FindOperator<Date> | undefined {
    if (query.fromIso && query.toIso) {
      return Between(new Date(query.fromIso), new Date(query.toIso));
    }
    if (query.fromIso) {
      return MoreThanOrEqual(new Date(query.fromIso));
    }
    if (query.toIso) {
      return LessThanOrEqual(new Date(query.toIso));
    }

    return undefined;
  }
}
