import type {
  CreateStaffDto,
  CreateTimeOffDto,
  ListStaffDto,
  UpdateStaffDto,
  UpsertWorkingHoursDto,
} from '@contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, In, LessThan, MoreThan, Repository } from 'typeorm';

import { StaffEntity } from './dao/staff.entity';
import { TimeOffEntity } from './dao/time-off.entity';
import { WorkingHoursEntity } from './dao/working-hours.entity';
import { StaffRole } from './enums/staff-role.enum';

@Injectable()
export class StaffRepository {
  public constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(WorkingHoursEntity)
    private readonly workingHoursRepository: Repository<WorkingHoursEntity>,
    @InjectRepository(TimeOffEntity)
    private readonly timeOffRepository: Repository<TimeOffEntity>,
  ) {}

  public async findStaff(tenantId: string, query: ListStaffDto = {}): Promise<StaffEntity[]> {
    const limit = query.limit ?? 200;
    const role = query.role ? this.mapRole(query.role) : undefined;
    const search = query.search?.trim();

    if (search) {
      const searchPattern = `%${search}%`;
      const filters: FindOptionsWhere<StaffEntity>[] = [
        {
          tenantId,
          ...(role ? { role } : {}),
          fullName: ILike(searchPattern),
        },
        {
          tenantId,
          ...(role ? { role } : {}),
          email: ILike(searchPattern),
        },
      ];

      return this.staffRepository.find({
        where: filters,
        order: { fullName: 'ASC' },
        take: limit,
      });
    }

    return this.staffRepository.find({
      where: {
        tenantId,
        ...(role ? { role } : {}),
      },
      order: { fullName: 'ASC' },
      take: limit,
    });
  }

  public createStaff(tenantId: string, payload: CreateStaffDto): StaffEntity {
    return this.staffRepository.create({
      tenantId,
      email: payload.email,
      fullName: payload.fullName,
      role: this.mapRole(payload.role ?? 'staff'),
      isActive: payload.isActive ?? true,
    });
  }

  public async saveStaff(staff: StaffEntity): Promise<StaffEntity> {
    return this.staffRepository.save(staff);
  }

  public async findStaffById(tenantId: string, staffId: string): Promise<StaffEntity | null> {
    return this.staffRepository.findOneBy({ id: staffId, tenantId });
  }

  public async findActiveStaffById(tenantId: string, staffId: string): Promise<StaffEntity | null> {
    return this.staffRepository.findOneBy({ id: staffId, tenantId, isActive: true });
  }

  public async findActiveStaffByTenant(tenantId: string): Promise<StaffEntity[]> {
    return this.staffRepository.find({
      where: { tenantId, isActive: true },
      order: { fullName: 'ASC' },
    });
  }

  public applyStaffUpdate(staff: StaffEntity, payload: UpdateStaffDto): StaffEntity {
    if (payload.email !== undefined) {
      staff.email = payload.email;
    }
    if (payload.fullName !== undefined) {
      staff.fullName = payload.fullName;
    }
    if (payload.role !== undefined) {
      staff.role = this.mapRole(payload.role);
    }
    if (payload.isActive !== undefined) {
      staff.isActive = payload.isActive;
    }

    return staff;
  }

  public async deleteStaff(tenantId: string, staffId: string): Promise<number> {
    const result = await this.staffRepository.delete({ id: staffId, tenantId });
    return result.affected ?? 0;
  }

  public async findWorkingHours(tenantId: string, staffId: string): Promise<WorkingHoursEntity[]> {
    return this.workingHoursRepository.find({
      where: { tenantId, staffId },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
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

  public async replaceWorkingHours(
    tenantId: string,
    staffId: string,
    payload: UpsertWorkingHoursDto,
  ): Promise<WorkingHoursEntity[]> {
    return this.workingHoursRepository.manager.transaction(
      async (manager): Promise<WorkingHoursEntity[]> => {
        await manager.delete(WorkingHoursEntity, { tenantId, staffId });

        if (!payload.items.length) {
          return [];
        }

        const entities = payload.items.map((entry) =>
          manager.create(WorkingHoursEntity, {
            tenantId,
            staffId,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
          }),
        );

        return manager.save(WorkingHoursEntity, entities);
      },
    );
  }

  public async findTimeOff(tenantId: string, staffId: string): Promise<TimeOffEntity[]> {
    return this.timeOffRepository.find({
      where: { tenantId, staffId },
      order: { startsAt: 'DESC' },
    });
  }

  public async findTimeOffInRange(
    tenantId: string,
    staffIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<TimeOffEntity[]> {
    if (!staffIds.length) {
      return [];
    }

    return this.timeOffRepository.find({
      where: {
        tenantId,
        staffId: In(staffIds),
        startsAt: LessThan(rangeEnd),
        endsAt: MoreThan(rangeStart),
      },
      order: { startsAt: 'ASC' },
    });
  }

  public createTimeOff(
    tenantId: string,
    staffId: string,
    payload: CreateTimeOffDto,
    startsAt: Date,
    endsAt: Date,
  ): TimeOffEntity {
    return this.timeOffRepository.create({
      tenantId,
      staffId,
      startsAt,
      endsAt,
      reason: payload.reason ?? null,
    });
  }

  public async saveTimeOff(timeOff: TimeOffEntity): Promise<TimeOffEntity> {
    return this.timeOffRepository.save(timeOff);
  }

  public async deleteTimeOff(
    tenantId: string,
    staffId: string,
    timeOffId: string,
  ): Promise<number> {
    const result = await this.timeOffRepository.delete({
      id: timeOffId,
      staffId,
      tenantId,
    });
    return result.affected ?? 0;
  }

  private mapRole(role: 'owner' | 'staff'): StaffRole {
    return role === 'owner' ? StaffRole.OWNER : StaffRole.STAFF;
  }
}
