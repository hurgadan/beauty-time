import { AppointmentStatus, ClientGender, ClientSalutation } from '@contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';

import { AppointmentEntity } from './dao/appointment.entity';
import { ClientEntity } from '../clients/dao/client.entity';
import { ServiceEntity } from '../services/dao/service.entity';
import { StaffEntity } from '../staff/dao/staff.entity';
import { TimeOffEntity } from '../staff/dao/time-off.entity';
import { WorkingHoursEntity } from '../staff/dao/working-hours.entity';
import { TenantEntity } from '../tenant/dao/tenant.entity';

export interface BusyInterval {
  staffId: string;
  blockedStart: Date;
  blockedEnd: Date;
}

export interface CreatePublicAppointmentInput {
  tenantId: string;
  staffId: string;
  serviceId: string;
  clientId: string;
  startsAt: Date;
  endsAt: Date;
  notes: string | null;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

@Injectable()
export class BookingPublicRepository {
  public constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(WorkingHoursEntity)
    private readonly workingHoursRepository: Repository<WorkingHoursEntity>,
    @InjectRepository(TimeOffEntity)
    private readonly timeOffRepository: Repository<TimeOffEntity>,
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  public async findTenantBySlug(slug: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOneBy({ slug });
  }

  public async findActiveServiceById(
    tenantId: string,
    serviceId: string,
  ): Promise<ServiceEntity | null> {
    return this.serviceRepository.findOneBy({
      id: serviceId,
      tenantId,
      isActive: true,
    });
  }

  public async findActiveStaffById(tenantId: string, staffId: string): Promise<StaffEntity | null> {
    return this.staffRepository.findOneBy({
      id: staffId,
      tenantId,
      isActive: true,
    });
  }

  public async findActiveStaffByTenant(tenantId: string): Promise<StaffEntity[]> {
    return this.staffRepository.find({
      where: { tenantId, isActive: true },
      order: { fullName: 'ASC' },
    });
  }

  public async findWorkingHoursForDay(
    tenantId: string,
    staffIds: string[],
    dayOfWeek: number,
  ): Promise<WorkingHoursEntity[]> {
    if (!staffIds.length) {
      return [];
    }

    return this.workingHoursRepository.find({
      where: {
        tenantId,
        dayOfWeek,
        staffId: In(staffIds),
      },
      order: { staffId: 'ASC', startTime: 'ASC' },
    });
  }

  public async findTimeOffIntervals(
    tenantId: string,
    staffIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<BusyInterval[]> {
    if (!staffIds.length) {
      return [];
    }

    const entries = await this.timeOffRepository.find({
      where: {
        tenantId,
        staffId: In(staffIds),
        startsAt: LessThan(rangeEnd),
        endsAt: MoreThan(rangeStart),
      },
      order: { startsAt: 'ASC' },
    });

    return entries.map((entry) => ({
      staffId: entry.staffId,
      blockedStart: entry.startsAt,
      blockedEnd: entry.endsAt,
    }));
  }

  public async findAppointmentBusyIntervals(
    tenantId: string,
    staffIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<BusyInterval[]> {
    if (!staffIds.length) {
      return [];
    }

    const rows = (await this.dataSource.query(
      `
        SELECT
          a.staff_id AS "staffId",
          (a.starts_at - make_interval(mins => s.buffer_before_minutes)) AS "blockedStart",
          (a.ends_at + make_interval(mins => s.buffer_after_minutes)) AS "blockedEnd"
        FROM appointments a
        INNER JOIN services s ON s.id = a.service_id
        WHERE
          a.tenant_id = $1::uuid
          AND a.staff_id = ANY($2::uuid[])
          AND a.status <> ALL($3::appointment_status_enum[])
          AND (a.starts_at - make_interval(mins => s.buffer_before_minutes)) < $4::timestamptz
          AND (a.ends_at + make_interval(mins => s.buffer_after_minutes)) > $5::timestamptz
      `,
      [
        tenantId,
        staffIds,
        [AppointmentStatus.CANCELLED_BY_CLIENT, AppointmentStatus.CANCELLED_BY_STAFF],
        rangeEnd.toISOString(),
        rangeStart.toISOString(),
      ],
    )) as Array<{ staffId: string; blockedStart: string; blockedEnd: string }>;

    return rows.map((row) => ({
      staffId: row.staffId,
      blockedStart: new Date(row.blockedStart),
      blockedEnd: new Date(row.blockedEnd),
    }));
  }

  public async findClientByEmail(tenantId: string, email: string): Promise<ClientEntity | null> {
    return this.clientRepository.findOneBy({ tenantId, email });
  }

  public createClient(tenantId: string, fullName: string, email: string): ClientEntity {
    const { firstName, lastName } = splitClientName(fullName);

    return this.clientRepository.create({
      tenantId,
      email,
      firstName,
      lastName,
      salutation: ClientSalutation.NONE,
      gender: ClientGender.UNSPECIFIED,
      phone: null,
    });
  }

  public async saveClient(client: ClientEntity): Promise<ClientEntity> {
    return this.clientRepository.save(client);
  }

  public async tryCreatePublicAppointment(
    input: CreatePublicAppointmentInput,
  ): Promise<AppointmentEntity | null> {
    return this.dataSource.transaction(async (manager): Promise<AppointmentEntity | null> => {
      const staff = await manager.findOne(StaffEntity, {
        where: {
          id: input.staffId,
          tenantId: input.tenantId,
          isActive: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!staff) {
        return null;
      }

      const conflict = (await manager.query(
        `
          SELECT 1
          FROM appointments a
          INNER JOIN services s ON s.id = a.service_id
          WHERE
            a.tenant_id = $1::uuid
            AND a.staff_id = $2::uuid
            AND a.status <> ALL($3::appointment_status_enum[])
            AND (a.starts_at - make_interval(mins => s.buffer_before_minutes)) < $4::timestamptz
            AND (a.ends_at + make_interval(mins => s.buffer_after_minutes)) > $5::timestamptz
          LIMIT 1
        `,
        [
          input.tenantId,
          input.staffId,
          [AppointmentStatus.CANCELLED_BY_CLIENT, AppointmentStatus.CANCELLED_BY_STAFF],
          addMinutes(input.endsAt, input.bufferAfterMinutes).toISOString(),
          addMinutes(input.startsAt, -input.bufferBeforeMinutes).toISOString(),
        ],
      )) as unknown[];

      if (conflict.length > 0) {
        return null;
      }

      const timeOffConflict = await manager.findOne(TimeOffEntity, {
        where: {
          tenantId: input.tenantId,
          staffId: input.staffId,
          startsAt: LessThan(addMinutes(input.endsAt, input.bufferAfterMinutes)),
          endsAt: MoreThan(addMinutes(input.startsAt, -input.bufferBeforeMinutes)),
        },
        select: { id: true },
      });

      if (timeOffConflict) {
        return null;
      }

      const appointment = manager.create(AppointmentEntity, {
        tenantId: input.tenantId,
        staffId: input.staffId,
        serviceId: input.serviceId,
        clientId: input.clientId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        notes: input.notes,
      });

      return manager.save(AppointmentEntity, appointment);
    });
  }

  public async findAppointmentById(id: string): Promise<AppointmentEntity | null> {
    return this.appointmentRepository.findOneBy({ id });
  }

  public async saveAppointment(appointment: AppointmentEntity): Promise<AppointmentEntity> {
    return this.appointmentRepository.save(appointment);
  }
}

function addMinutes(input: Date, minutes: number): Date {
  return new Date(input.getTime() + minutes * 60_000);
}

function splitClientName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: 'Client', lastName: '-' };
  }

  const parts = normalized.split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '-';

  return { firstName, lastName };
}
