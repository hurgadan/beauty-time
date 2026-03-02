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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { CreateStaffRequestDto } from "./dto/create-staff.request.dto";
import { CreateTimeOffRequestDto } from "./dto/create-time-off.request.dto";
import { ListStaffQueryDto } from "./dto/list-staff.query.dto";
import { ListStaffResponseDto } from "./dto/list-staff.response.dto";
import { ListTimeOffResponseDto } from "./dto/list-time-off.response.dto";
import { ListWorkingHoursResponseDto } from "./dto/list-working-hours.response.dto";
import { StaffItemDto } from "./dto/staff-item.dto";
import { TimeOffItemDto } from "./dto/time-off-item.dto";
import { UpdateStaffRequestDto } from "./dto/update-staff.request.dto";
import { UpsertWorkingHoursRequestDto } from "./dto/upsert-working-hours.request.dto";
import { StaffService } from "./staff.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";

@ApiTags("staff")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("crm/staff")
export class StaffController {
  public constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: "List tenant staff" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "role", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ type: ListStaffResponseDto })
  public async listStaff(
    @Req() request: RequestWithUser,
    @Query() query: ListStaffQueryDto,
  ): Promise<ListStaffResponseDto> {
    return this.staffService.listStaff(this.getTenantId(request), query);
  }

  @Post()
  @ApiOperation({ summary: "Create staff member" })
  @ApiBody({ type: CreateStaffRequestDto })
  @ApiCreatedResponse({ type: StaffItemDto })
  public async createStaff(
    @Req() request: RequestWithUser,
    @Body() payload: CreateStaffRequestDto,
  ): Promise<StaffItemDto> {
    return this.staffService.createStaff(this.getTenantId(request), payload);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update staff member" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateStaffRequestDto })
  @ApiOkResponse({ type: StaffItemDto })
  public async updateStaff(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() payload: UpdateStaffRequestDto,
  ): Promise<StaffItemDto> {
    return this.staffService.updateStaff(
      this.getTenantId(request),
      id,
      payload,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete staff member" })
  @ApiParam({ name: "id", type: String })
  @ApiNoContentResponse({ description: "Staff deleted" })
  public async deleteStaff(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.staffService.deleteStaff(this.getTenantId(request), id);
  }

  @Get(":id/working-hours")
  @ApiOperation({ summary: "List staff working hours" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ type: ListWorkingHoursResponseDto })
  public async listWorkingHours(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ListWorkingHoursResponseDto> {
    return this.staffService.listWorkingHours(this.getTenantId(request), id);
  }

  @Put(":id/working-hours")
  @ApiOperation({ summary: "Replace staff working hours" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpsertWorkingHoursRequestDto })
  @ApiOkResponse({ type: ListWorkingHoursResponseDto })
  public async replaceWorkingHours(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() payload: UpsertWorkingHoursRequestDto,
  ): Promise<ListWorkingHoursResponseDto> {
    return this.staffService.replaceWorkingHours(
      this.getTenantId(request),
      id,
      payload,
    );
  }

  @Get(":id/time-off")
  @ApiOperation({ summary: "List staff time-off periods" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ type: ListTimeOffResponseDto })
  public async listTimeOff(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ListTimeOffResponseDto> {
    return this.staffService.listTimeOff(this.getTenantId(request), id);
  }

  @Post(":id/time-off")
  @ApiOperation({ summary: "Create staff time-off period" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: CreateTimeOffRequestDto })
  @ApiCreatedResponse({ type: TimeOffItemDto })
  public async createTimeOff(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() payload: CreateTimeOffRequestDto,
  ): Promise<TimeOffItemDto> {
    return this.staffService.createTimeOff(
      this.getTenantId(request),
      id,
      payload,
    );
  }

  @Delete(":staffId/time-off/:timeOffId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete staff time-off period" })
  @ApiParam({ name: "staffId", type: String })
  @ApiParam({ name: "timeOffId", type: String })
  @ApiNoContentResponse({ description: "Time-off entry deleted" })
  public async deleteTimeOff(
    @Req() request: RequestWithUser,
    @Param("staffId", ParseUUIDPipe) staffId: string,
    @Param("timeOffId", ParseUUIDPipe) timeOffId: string,
  ): Promise<void> {
    return this.staffService.deleteTimeOff(
      this.getTenantId(request),
      staffId,
      timeOffId,
    );
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }

    return tenantId;
  }
}
