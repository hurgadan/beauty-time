import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { BookingAppointmentsService } from "./booking-appointments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";
import { AppointmentListItemDto } from "./dto/management/appointment-list-item.dto";
import { CreateAppointmentRequestDto } from "./dto/management/create-appointment.request.dto";
import { ListAppointmentsQueryDto } from "./dto/management/list-appointments.query.dto";
import { ListAppointmentsResponseDto } from "./dto/management/list-appointments.response.dto";
import { UpdateAppointmentRequestDto } from "./dto/management/update-appointment.request.dto";

@ApiTags("appointments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("crm/appointments")
export class CrmBookingAppointmentsController {
  public constructor(
    private readonly bookingAppointmentsService: BookingAppointmentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List tenant appointments" })
  @ApiQuery({ name: "staffId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiQuery({ name: "fromIso", required: false, type: String })
  @ApiQuery({ name: "toIso", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ type: ListAppointmentsResponseDto })
  public async listAppointments(
    @Req() request: RequestWithUser,
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<ListAppointmentsResponseDto> {
    return this.bookingAppointmentsService.listAppointments(
      this.getTenantId(request),
      query,
    );
  }

  @Post()
  @ApiOperation({ summary: "Create appointment from backoffice flow" })
  @ApiBody({ type: CreateAppointmentRequestDto })
  @ApiCreatedResponse({ type: AppointmentListItemDto })
  public async createAppointment(
    @Req() request: RequestWithUser,
    @Body() payload: CreateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    return this.bookingAppointmentsService.createAppointment(
      this.getTenantId(request),
      payload,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update appointment status/details" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateAppointmentRequestDto })
  @ApiOkResponse({ type: AppointmentListItemDto })
  public async updateAppointment(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() payload: UpdateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    return this.bookingAppointmentsService.updateAppointment(
      this.getTenantId(request),
      id,
      payload,
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
