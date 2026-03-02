import type {
  CreateStaffRequestDto,
  CreateTimeOffRequestDto,
  ListStaffRequestDto,
  ListStaffResponseDto,
  ListTimeOffResponseDto,
  ListWorkingHoursResponseDto,
  StaffItemDto,
  TimeOffItemDto,
  UpdateStaffRequestDto,
  UpsertWorkingHoursRequestDto,
  WorkingHoursItemDto,
} from "@contracts";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { StaffEntity } from "./dao/staff.entity";
import { TimeOffEntity } from "./dao/time-off.entity";
import { WorkingHoursEntity } from "./dao/working-hours.entity";
import { StaffRepository } from "./staff.repository";

@Injectable()
export class StaffService {
  public constructor(private readonly staffRepository: StaffRepository) {}

  public async listStaff(
    tenantId: string,
    query: ListStaffRequestDto = {},
  ): Promise<ListStaffResponseDto> {
    const items = await this.staffRepository.findStaff(tenantId, query);

    return {
      items: items.map((staff) => this.mapStaff(staff)),
    };
  }

  public async createStaff(
    tenantId: string,
    payload: CreateStaffRequestDto,
  ): Promise<StaffItemDto> {
    try {
      const staff = this.staffRepository.createStaff(tenantId, payload);
      const saved = await this.staffRepository.saveStaff(staff);
      return this.mapStaff(saved);
    } catch (error: unknown) {
      this.handleUniqueConstraint(
        error,
        "Staff with this email already exists",
      );
      throw error;
    }
  }

  public async updateStaff(
    tenantId: string,
    staffId: string,
    payload: UpdateStaffRequestDto,
  ): Promise<StaffItemDto> {
    const staff = await this.staffRepository.findStaffById(tenantId, staffId);

    if (!staff) {
      throw new NotFoundException("Staff not found");
    }

    const updated = this.staffRepository.applyStaffUpdate(staff, payload);

    try {
      const saved = await this.staffRepository.saveStaff(updated);
      return this.mapStaff(saved);
    } catch (error: unknown) {
      this.handleUniqueConstraint(
        error,
        "Staff with this email already exists",
      );
      throw error;
    }
  }

  public async deleteStaff(tenantId: string, staffId: string): Promise<void> {
    try {
      const affected = await this.staffRepository.deleteStaff(
        tenantId,
        staffId,
      );
      if (!affected) {
        throw new NotFoundException("Staff not found");
      }
    } catch (error: unknown) {
      this.handleForeignKeyConstraint(
        error,
        "Staff is used in appointments and cannot be deleted",
      );
      throw error;
    }
  }

  public async listWorkingHours(
    tenantId: string,
    staffId: string,
  ): Promise<ListWorkingHoursResponseDto> {
    await this.ensureStaff(tenantId, staffId);

    const items = await this.staffRepository.findWorkingHours(
      tenantId,
      staffId,
    );

    return {
      items: items.map((item) => this.mapWorkingHours(item)),
    };
  }

  public async replaceWorkingHours(
    tenantId: string,
    staffId: string,
    payload: UpsertWorkingHoursRequestDto,
  ): Promise<ListWorkingHoursResponseDto> {
    await this.ensureStaff(tenantId, staffId);

    for (const entry of payload.items) {
      if (entry.startTime >= entry.endTime) {
        throw new BadRequestException("Working hours start must be before end");
      }
    }

    const saved = await this.staffRepository.replaceWorkingHours(
      tenantId,
      staffId,
      payload,
    );

    const sorted = [...saved].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return {
      items: sorted.map((item) => this.mapWorkingHours(item)),
    };
  }

  public async listTimeOff(
    tenantId: string,
    staffId: string,
  ): Promise<ListTimeOffResponseDto> {
    await this.ensureStaff(tenantId, staffId);

    const items = await this.staffRepository.findTimeOff(tenantId, staffId);

    return {
      items: items.map((item) => this.mapTimeOff(item)),
    };
  }

  public async createTimeOff(
    tenantId: string,
    staffId: string,
    payload: CreateTimeOffRequestDto,
  ): Promise<TimeOffItemDto> {
    await this.ensureStaff(tenantId, staffId);

    const startsAt = new Date(payload.startsAtIso);
    const endsAt = new Date(payload.endsAtIso);

    if (startsAt >= endsAt) {
      throw new BadRequestException("Time-off start must be before end");
    }

    const timeOff = this.staffRepository.createTimeOff(
      tenantId,
      staffId,
      payload,
      startsAt,
      endsAt,
    );
    const saved = await this.staffRepository.saveTimeOff(timeOff);

    return this.mapTimeOff(saved);
  }

  public async deleteTimeOff(
    tenantId: string,
    staffId: string,
    timeOffId: string,
  ): Promise<void> {
    await this.ensureStaff(tenantId, staffId);

    const affected = await this.staffRepository.deleteTimeOff(
      tenantId,
      staffId,
      timeOffId,
    );

    if (!affected) {
      throw new NotFoundException("Time-off entry not found");
    }
  }

  private async ensureStaff(tenantId: string, staffId: string): Promise<void> {
    const staff = await this.staffRepository.findStaffById(tenantId, staffId);

    if (!staff) {
      throw new NotFoundException("Staff not found");
    }
  }

  private mapStaff(staff: StaffEntity): StaffItemDto {
    return {
      id: staff.id,
      tenantId: staff.tenantId,
      email: staff.email,
      fullName: staff.fullName,
      role: staff.role,
      isActive: staff.isActive,
    };
  }

  private mapWorkingHours(entity: WorkingHoursEntity): WorkingHoursItemDto {
    return {
      id: entity.id,
      staffId: entity.staffId,
      dayOfWeek: entity.dayOfWeek,
      startTime: entity.startTime,
      endTime: entity.endTime,
    };
  }

  private mapTimeOff(entity: TimeOffEntity): TimeOffItemDto {
    return {
      id: entity.id,
      staffId: entity.staffId,
      startsAtIso: entity.startsAt.toISOString(),
      endsAtIso: entity.endsAt.toISOString(),
      reason: entity.reason,
    };
  }

  private handleUniqueConstraint(error: unknown, message: string): void {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      throw new ConflictException(message);
    }
  }

  private handleForeignKeyConstraint(error: unknown, message: string): void {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23503"
    ) {
      throw new ConflictException(message);
    }
  }
}
