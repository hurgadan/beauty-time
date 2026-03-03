import type {
  CreateStaffDto,
  CreateTimeOffDto,
  ListStaffDto,
  UpdateStaffDto,
  UpsertWorkingHoursDto,
} from '@contracts';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { StaffEntity } from './dao/staff.entity';
import { TimeOffEntity } from './dao/time-off.entity';
import { WorkingHoursEntity } from './dao/working-hours.entity';
import { StaffRepository } from './staff.repository';

@Injectable()
export class StaffService {
  public constructor(private readonly staffRepository: StaffRepository) {}

  public async listStaff(tenantId: string, query: ListStaffDto = {}): Promise<StaffEntity[]> {
    return this.staffRepository.findStaff(tenantId, query);
  }

  public async createStaff(tenantId: string, payload: CreateStaffDto): Promise<StaffEntity> {
    try {
      const staff = this.staffRepository.createStaff(tenantId, payload);
      return this.staffRepository.saveStaff(staff);
    } catch (error: unknown) {
      this.handleUniqueConstraint(error, 'Staff with this email already exists');
      throw error;
    }
  }

  public async findActiveStaffById(tenantId: string, staffId: string): Promise<StaffEntity | null> {
    return this.staffRepository.findActiveStaffById(tenantId, staffId);
  }

  public async findActiveStaffByTenant(tenantId: string): Promise<StaffEntity[]> {
    return this.staffRepository.findActiveStaffByTenant(tenantId);
  }

  public async updateStaff(
    tenantId: string,
    staffId: string,
    payload: UpdateStaffDto,
  ): Promise<StaffEntity> {
    const staff = await this.staffRepository.findStaffById(tenantId, staffId);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const updated = this.staffRepository.applyStaffUpdate(staff, payload);

    try {
      return this.staffRepository.saveStaff(updated);
    } catch (error: unknown) {
      this.handleUniqueConstraint(error, 'Staff with this email already exists');
      throw error;
    }
  }

  public async deleteStaff(tenantId: string, staffId: string): Promise<void> {
    try {
      const affected = await this.staffRepository.deleteStaff(tenantId, staffId);
      if (!affected) {
        throw new NotFoundException('Staff not found');
      }
    } catch (error: unknown) {
      this.handleForeignKeyConstraint(error, 'Staff is used in appointments and cannot be deleted');
      throw error;
    }
  }

  public async listWorkingHours(tenantId: string, staffId: string): Promise<WorkingHoursEntity[]> {
    await this.ensureStaff(tenantId, staffId);

    return this.staffRepository.findWorkingHours(tenantId, staffId);
  }

  public async findWorkingHoursForDay(
    tenantId: string,
    staffIds: string[],
    dayOfWeek: number,
  ): Promise<WorkingHoursEntity[]> {
    return this.staffRepository.findWorkingHoursForDay(tenantId, staffIds, dayOfWeek);
  }

  public async replaceWorkingHours(
    tenantId: string,
    staffId: string,
    payload: UpsertWorkingHoursDto,
  ): Promise<WorkingHoursEntity[]> {
    await this.ensureStaff(tenantId, staffId);

    for (const entry of payload.items) {
      if (entry.startTime >= entry.endTime) {
        throw new BadRequestException('Working hours start must be before end');
      }
    }

    const saved = await this.staffRepository.replaceWorkingHours(tenantId, staffId, payload);

    return [...saved].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  public async listTimeOff(tenantId: string, staffId: string): Promise<TimeOffEntity[]> {
    await this.ensureStaff(tenantId, staffId);

    return this.staffRepository.findTimeOff(tenantId, staffId);
  }

  public async findTimeOffInRange(
    tenantId: string,
    staffIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<TimeOffEntity[]> {
    return this.staffRepository.findTimeOffInRange(tenantId, staffIds, rangeStart, rangeEnd);
  }

  public async createTimeOff(
    tenantId: string,
    staffId: string,
    payload: CreateTimeOffDto,
  ): Promise<TimeOffEntity> {
    await this.ensureStaff(tenantId, staffId);

    const startsAt = new Date(payload.startsAtIso);
    const endsAt = new Date(payload.endsAtIso);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Time-off start must be before end');
    }

    const timeOff = this.staffRepository.createTimeOff(
      tenantId,
      staffId,
      payload,
      startsAt,
      endsAt,
    );
    return this.staffRepository.saveTimeOff(timeOff);
  }

  public async deleteTimeOff(tenantId: string, staffId: string, timeOffId: string): Promise<void> {
    await this.ensureStaff(tenantId, staffId);

    const affected = await this.staffRepository.deleteTimeOff(tenantId, staffId, timeOffId);

    if (!affected) {
      throw new NotFoundException('Time-off entry not found');
    }
  }

  private async ensureStaff(tenantId: string, staffId: string): Promise<void> {
    const staff = await this.staffRepository.findStaffById(tenantId, staffId);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
  }

  private handleUniqueConstraint(error: unknown, message: string): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw new ConflictException(message);
    }
  }

  private handleForeignKeyConstraint(error: unknown, message: string): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23503'
    ) {
      throw new ConflictException(message);
    }
  }
}
