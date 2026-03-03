import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { ListStaffQueryDto } from './dto/list-staff.query.dto';
import { StaffItemDto } from './dto/staff-item.dto';
import { TimeOffItemDto } from './dto/time-off-item.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpsertWorkingHoursDto } from './dto/upsert-working-hours.dto';
import { WorkingHoursItemDto } from './dto/working-hours-item.dto';
import { StaffService } from './staff.service';
import { transformToDto } from '../../_common/transform-to-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/staff')
export class CrmStaffController {
  public constructor(private readonly staffService: StaffService) {}

  @Get('list')
  @ApiOperation({ summary: 'List tenant staff' })
  @ApiOkResponse({ type: StaffItemDto, isArray: true })
  public async listStaff(
    @Req() request: RequestWithUser,
    @Query() query: ListStaffQueryDto,
  ): Promise<StaffItemDto[]> {
    const staffItems = await this.staffService.listStaff(this.getTenantId(request), query);

    return staffItems.map((staffItem) => transformToDto(StaffItemDto, staffItem));
  }

  @Post()
  @ApiOperation({ summary: 'Create staff member' })
  @ApiBody({ type: CreateStaffDto })
  @ApiCreatedResponse({ type: StaffItemDto })
  public async createStaff(
    @Req() request: RequestWithUser,
    @Body() payload: CreateStaffDto,
  ): Promise<StaffItemDto> {
    const staff = await this.staffService.createStaff(this.getTenantId(request), payload);

    return transformToDto(StaffItemDto, staff);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateStaffDto })
  @ApiOkResponse({ type: StaffItemDto })
  public async updateStaff(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateStaffDto,
  ): Promise<StaffItemDto> {
    const staff = await this.staffService.updateStaff(this.getTenantId(request), id, payload);

    return transformToDto(StaffItemDto, staff);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Staff deleted' })
  public async deleteStaff(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.staffService.deleteStaff(this.getTenantId(request), id);
  }

  @Get(':id/working-hours')
  @ApiOperation({ summary: 'List staff working hours' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WorkingHoursItemDto, isArray: true })
  public async listWorkingHours(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkingHoursItemDto[]> {
    const workingHoursItems = await this.staffService.listWorkingHours(
      this.getTenantId(request),
      id,
    );

    return workingHoursItems.map((workingHoursItem) =>
      transformToDto(WorkingHoursItemDto, workingHoursItem),
    );
  }

  @Put(':id/working-hours')
  @ApiOperation({ summary: 'Replace staff working hours' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpsertWorkingHoursDto })
  @ApiOkResponse({ type: WorkingHoursItemDto, isArray: true })
  public async replaceWorkingHours(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpsertWorkingHoursDto,
  ): Promise<WorkingHoursItemDto[]> {
    const workingHoursItems = await this.staffService.replaceWorkingHours(
      this.getTenantId(request),
      id,
      payload,
    );

    return workingHoursItems.map((workingHoursItem) =>
      transformToDto(WorkingHoursItemDto, workingHoursItem),
    );
  }

  @Get(':id/time-off')
  @ApiOperation({ summary: 'List staff time-off periods' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TimeOffItemDto, isArray: true })
  public async listTimeOff(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TimeOffItemDto[]> {
    const timeOffItems = await this.staffService.listTimeOff(this.getTenantId(request), id);

    return timeOffItems.map((timeOffItem) =>
      transformToDto(TimeOffItemDto, {
        ...timeOffItem,
        startsAtIso: timeOffItem.startsAt.toISOString(),
        endsAtIso: timeOffItem.endsAt.toISOString(),
      }),
    );
  }

  @Post(':id/time-off')
  @ApiOperation({ summary: 'Create staff time-off period' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateTimeOffDto })
  @ApiCreatedResponse({ type: TimeOffItemDto })
  public async createTimeOff(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: CreateTimeOffDto,
  ): Promise<TimeOffItemDto> {
    const timeOff = await this.staffService.createTimeOff(this.getTenantId(request), id, payload);

    return transformToDto(TimeOffItemDto, {
      ...timeOff,
      startsAtIso: timeOff.startsAt.toISOString(),
      endsAtIso: timeOff.endsAt.toISOString(),
    });
  }

  @Delete(':staffId/time-off/:timeOffId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete staff time-off period' })
  @ApiParam({ name: 'staffId', type: String })
  @ApiParam({ name: 'timeOffId', type: String })
  @ApiNoContentResponse({ description: 'Time-off entry deleted' })
  public async deleteTimeOff(
    @Req() request: RequestWithUser,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('timeOffId', ParseUUIDPipe) timeOffId: string,
  ): Promise<void> {
    return this.staffService.deleteTimeOff(this.getTenantId(request), staffId, timeOffId);
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant in token');
    }

    return tenantId;
  }
}
