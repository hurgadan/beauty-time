import { AppointmentStatus } from '@contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AppointmentEntity } from './dao/appointment.entity';

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
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

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
          AND a.status <> ALL($3::varchar[])
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

  public async tryCreatePublicAppointment(
    input: CreatePublicAppointmentInput,
  ): Promise<AppointmentEntity | null> {
    return this.dataSource.transaction(async (manager): Promise<AppointmentEntity | null> => {
      const lockedStaff = (await manager.query(
        `
          SELECT id
          FROM staff
          WHERE id = $1::uuid AND tenant_id = $2::uuid AND is_active = TRUE
          FOR UPDATE
        `,
        [input.staffId, input.tenantId],
      )) as Array<{ id: string }>;

      if (!lockedStaff.length) {
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
            AND a.status <> ALL($3::varchar[])
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

      const timeOffConflict = (await manager.query(
        `
          SELECT 1
          FROM time_off
          WHERE
            tenant_id = $1::uuid
            AND staff_id = $2::uuid
            AND starts_at < $3::timestamptz
            AND ends_at > $4::timestamptz
          LIMIT 1
        `,
        [
          input.tenantId,
          input.staffId,
          addMinutes(input.endsAt, input.bufferAfterMinutes).toISOString(),
          addMinutes(input.startsAt, -input.bufferBeforeMinutes).toISOString(),
        ],
      )) as unknown[];

      if (timeOffConflict.length > 0) {
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
