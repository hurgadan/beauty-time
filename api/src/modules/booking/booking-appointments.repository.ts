import type { CreateAppointmentDto, ListAppointmentsDto } from '@contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  type FindOperator,
  type FindOptionsWhere,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { AppointmentEntity } from './dao/appointment.entity';

@Injectable()
export class BookingAppointmentsRepository {
  public constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  public async findAppointments(
    tenantId: string,
    query: ListAppointmentsDto = {},
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
      order: { startsAt: 'DESC' },
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
    payload: CreateAppointmentDto,
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

  public async saveAppointment(appointment: AppointmentEntity): Promise<AppointmentEntity> {
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

  private buildStartsAtFilter(query: ListAppointmentsDto): FindOperator<Date> | undefined {
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
