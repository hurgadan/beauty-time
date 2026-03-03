import type {
  AvailabilityQueryDto,
  AvailabilitySlotDto,
  BookingConfigResponseDto,
  ConfirmAppointmentDto,
  ConfirmAppointmentResponseDto,
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
} from '@contracts';
import { AppointmentStatus } from '@contracts';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BookingPublicRepository } from './booking-public.repository';
import { StaffEntity } from '../staff/dao/staff.entity';

@Injectable()
export class BookingService {
  public constructor(private readonly bookingPublicRepository: BookingPublicRepository) {}

  public async getConfig(tenantSlug: string): Promise<BookingConfigResponseDto> {
    const tenant = await this.bookingPublicRepository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException('Tenant slug not found');
    }

    return {
      tenantSlug,
      timezone: tenant.timezone,
      reminderChannels: ['email'],
    };
  }

  public async listAvailability(
    tenantSlug: string,
    payload: AvailabilityQueryDto,
  ): Promise<AvailabilitySlotDto[]> {
    const tenant = await this.bookingPublicRepository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException('Tenant slug not found');
    }

    const service = await this.bookingPublicRepository.findActiveServiceById(
      tenant.id,
      payload.serviceId,
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const staff = await this.resolveStaff(tenant.id, payload.staffId);
    if (!staff.length) {
      return [];
    }

    const date = parseDateIso(payload.dateIso);
    const dayOfWeek = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();

    const dayStartUtc = zonedDateTimeToUtc(date, 0, 0, tenant.timezone);
    const nextDate = incrementDate(date);
    const dayEndUtc = zonedDateTimeToUtc(nextDate, 0, 0, tenant.timezone);

    const staffIds = staff.map((item) => item.id);
    const [workingHours, timeOffIntervals, appointmentIntervals] = await Promise.all([
      this.bookingPublicRepository.findWorkingHoursForDay(tenant.id, staffIds, dayOfWeek),
      this.bookingPublicRepository.findTimeOffIntervals(
        tenant.id,
        staffIds,
        dayStartUtc,
        dayEndUtc,
      ),
      this.bookingPublicRepository.findAppointmentBusyIntervals(
        tenant.id,
        staffIds,
        dayStartUtc,
        dayEndUtc,
      ),
    ]);

    const workingHoursByStaff = groupByStaff(workingHours);
    const busyIntervals = [...timeOffIntervals, ...appointmentIntervals];
    const busyByStaff = groupByStaff(busyIntervals);

    const slotStarts = new Map<number, AvailabilitySlotDto>();

    for (const staffMember of staff) {
      const staffHours = workingHoursByStaff.get(staffMember.id) ?? [];
      if (!staffHours.length) {
        continue;
      }

      const staffBusyIntervals = busyByStaff.get(staffMember.id) ?? [];

      for (const range of staffHours) {
        const startMinutes = parseTimeToMinutes(range.startTime);
        const endMinutes = parseTimeToMinutes(range.endTime);
        let candidateStartMinutes = roundUpToStep(startMinutes, SLOT_STEP_MINUTES);

        while (candidateStartMinutes + service.durationMinutes <= endMinutes) {
          const startsAt = zonedDateTimeToUtc(
            date,
            Math.floor(candidateStartMinutes / 60),
            candidateStartMinutes % 60,
            tenant.timezone,
          );
          const endsAt = addMinutes(startsAt, service.durationMinutes);
          const blockedStart = addMinutes(startsAt, -service.bufferBeforeMinutes);
          const blockedEnd = addMinutes(endsAt, service.bufferAfterMinutes);

          const hasConflict = staffBusyIntervals.some((interval) =>
            intersects(blockedStart, blockedEnd, interval.blockedStart, interval.blockedEnd),
          );

          if (!hasConflict) {
            slotStarts.set(startsAt.getTime(), {
              startsAtIso: startsAt.toISOString(),
              available: true,
            });
          }

          candidateStartMinutes += SLOT_STEP_MINUTES;
        }
      }
    }

    return [...slotStarts.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([, slot]) => slot);
  }

  public async createPublicAppointment(
    tenantSlug: string,
    payload: CreatePublicAppointmentDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    const tenant = await this.bookingPublicRepository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException('Tenant slug not found');
    }

    const service = await this.bookingPublicRepository.findActiveServiceById(
      tenant.id,
      payload.serviceId,
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const startsAt = new Date(payload.startsAtIso);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid startsAtIso');
    }

    const endsAt = addMinutes(startsAt, service.durationMinutes);
    const startInTenantTz = toZonedDateParts(startsAt, tenant.timezone);
    const endInTenantTz = toZonedDateParts(endsAt, tenant.timezone);

    if (startInTenantTz.dayOfWeek !== endInTenantTz.dayOfWeek) {
      throw new BadRequestException('Appointment cannot span across multiple days');
    }

    if (startInTenantTz.second !== 0 || endInTenantTz.second !== 0) {
      throw new BadRequestException('Appointment slots must use minute precision');
    }

    if (startInTenantTz.minuteOfDay % SLOT_STEP_MINUTES !== 0) {
      throw new BadRequestException('Appointment must be aligned to slot step');
    }

    const candidateStaff = await this.resolveStaff(tenant.id, payload.staffId);
    if (!candidateStaff.length) {
      throw new NotFoundException('Staff not found');
    }

    const clientEmail = payload.clientEmail.trim().toLowerCase();
    let client = await this.bookingPublicRepository.findClientByEmail(tenant.id, clientEmail);
    if (!client) {
      const newClient = this.bookingPublicRepository.createClient(
        tenant.id,
        payload.clientName,
        clientEmail,
      );
      client = await this.bookingPublicRepository.saveClient(newClient);
    }

    for (const staffMember of candidateStaff) {
      const staffHasHours = await this.isWithinWorkingHours(
        tenant.id,
        staffMember.id,
        startInTenantTz.dayOfWeek,
        startInTenantTz.minuteOfDay,
        endInTenantTz.minuteOfDay,
      );

      if (!staffHasHours) {
        continue;
      }

      const created = await this.bookingPublicRepository.tryCreatePublicAppointment({
        tenantId: tenant.id,
        staffId: staffMember.id,
        serviceId: service.id,
        clientId: client.id,
        startsAt,
        endsAt,
        notes: null,
        bufferBeforeMinutes: service.bufferBeforeMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
      });

      if (created) {
        return { id: created.id, tenantSlug };
      }
    }

    throw new ConflictException('Selected slot is not available');
  }

  public async confirmAppointment(
    payload: ConfirmAppointmentDto,
  ): Promise<ConfirmAppointmentResponseDto> {
    const appointment = await this.bookingPublicRepository.findAppointmentById(payload.id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      appointment.status === AppointmentStatus.CANCELLED_BY_CLIENT ||
      appointment.status === AppointmentStatus.CANCELLED_BY_STAFF
    ) {
      throw new ConflictException('Cancelled appointment cannot be confirmed');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED_BY_REMINDER) {
      appointment.status = AppointmentStatus.CONFIRMED_BY_REMINDER;
      await this.bookingPublicRepository.saveAppointment(appointment);
    }

    return { id: appointment.id, status: appointment.status };
  }

  private async resolveStaff(tenantId: string, staffId?: string): Promise<StaffEntity[]> {
    if (staffId) {
      const staff = await this.bookingPublicRepository.findActiveStaffById(tenantId, staffId);
      return staff ? [staff] : [];
    }

    return this.bookingPublicRepository.findActiveStaffByTenant(tenantId);
  }

  private async isWithinWorkingHours(
    tenantId: string,
    staffId: string,
    dayOfWeek: number,
    startMinute: number,
    endMinute: number,
  ): Promise<boolean> {
    const workingHours = await this.bookingPublicRepository.findWorkingHoursForDay(
      tenantId,
      [staffId],
      dayOfWeek,
    );
    return workingHours.some((entry) => {
      const rangeStart = parseTimeToMinutes(entry.startTime);
      const rangeEnd = parseTimeToMinutes(entry.endTime);

      return startMinute >= rangeStart && endMinute <= rangeEnd;
    });
  }
}

const SLOT_STEP_MINUTES = 30;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

interface ZonedDateParts {
  dayOfWeek: number;
  minuteOfDay: number;
  second: number;
}

function groupByStaff<T extends { staffId: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const current = grouped.get(item.staffId) ?? [];
    current.push(item);
    grouped.set(item.staffId, current);
  }

  return grouped;
}

function addMinutes(value: Date, minutes: number): Date {
  return new Date(value.getTime() + minutes * 60_000);
}

function parseDateIso(dateIso: string): DateParts {
  const match = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    throw new BadRequestException('dateIso must be in YYYY-MM-DD format');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new BadRequestException('dateIso is invalid');
  }

  return { year, month, day };
}

function incrementDate(value: DateParts): DateParts {
  const next = new Date(Date.UTC(value.year, value.month - 1, value.day + 1));

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((item) => Number(item));
  return hours * 60 + minutes;
}

function roundUpToStep(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

function intersects(leftStart: Date, leftEnd: Date, rightStart: Date, rightEnd: Date): boolean {
  return leftStart < rightEnd && leftEnd > rightStart;
}

function zonedDateTimeToUtc(
  date: DateParts,
  hours: number,
  minutes: number,
  timezone: string,
): Date {
  const naiveUtcMillis = Date.UTC(date.year, date.month - 1, date.day, hours, minutes, 0, 0);
  let resultMillis = naiveUtcMillis - getTimeZoneOffsetMillis(new Date(naiveUtcMillis), timezone);
  const adjustedMillis = naiveUtcMillis - getTimeZoneOffsetMillis(new Date(resultMillis), timezone);

  if (adjustedMillis !== resultMillis) {
    resultMillis = adjustedMillis;
  }

  return new Date(resultMillis);
}

function toZonedDateParts(date: Date, timezone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  const second = Number(parts.find((part) => part.type === 'second')?.value ?? '0');

  return {
    dayOfWeek: mapWeekdayToNumber(weekday),
    minuteOfDay: hour * 60 + minute,
    second,
  };
}

function mapWeekdayToNumber(weekday: string | undefined): number {
  switch (weekday) {
    case 'Sun':
      return 0;
    case 'Mon':
      return 1;
    case 'Tue':
      return 2;
    case 'Wed':
      return 3;
    case 'Thu':
      return 4;
    case 'Fri':
      return 5;
    case 'Sat':
      return 6;
    default:
      return 0;
  }
}

function getTimeZoneOffsetMillis(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const value = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')
    ?.value.replace('UTC', 'GMT');

  if (!value || value === 'GMT') {
    return 0;
  }

  const match = value.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');

  return sign * (hours * 60 + minutes) * 60_000;
}
