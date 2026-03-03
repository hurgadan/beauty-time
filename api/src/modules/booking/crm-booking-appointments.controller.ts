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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { BookingAppointmentsService } from './booking-appointments.service';
import { transformToDto } from '../../_common/transform-to-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';
import { AppointmentDto } from './dto/management/appointment.dto';
import { CreateAppointmentDto } from './dto/management/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/management/list-appointments.query.dto';
import { UpdateAppointmentDto } from './dto/management/update-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/appointments')
export class CrmBookingAppointmentsController {
  public constructor(private readonly bookingAppointmentsService: BookingAppointmentsService) {}

  @Get('list')
  @ApiOperation({ summary: 'List tenant appointments' })
  @ApiOkResponse({ type: AppointmentDto, isArray: true })
  public async listAppointments(
    @Req() request: RequestWithUser,
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentDto[]> {
    const appointments = await this.bookingAppointmentsService.listAppointments(
      this.getTenantId(request),
      query,
    );

    return appointments.map((appointment) =>
      transformToDto(AppointmentDto, {
        ...appointment,
        startsAtIso: appointment.startsAt.toISOString(),
        endsAtIso: appointment.endsAt.toISOString(),
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create appointment from backoffice flow' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiCreatedResponse({ type: AppointmentDto })
  public async createAppointment(
    @Req() request: RequestWithUser,
    @Body() payload: CreateAppointmentDto,
  ): Promise<AppointmentDto> {
    const appointment = await this.bookingAppointmentsService.createAppointment(
      this.getTenantId(request),
      payload,
    );

    return transformToDto(AppointmentDto, {
      ...appointment,
      startsAtIso: appointment.startsAt.toISOString(),
      endsAtIso: appointment.endsAt.toISOString(),
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment status/details' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiOkResponse({ type: AppointmentDto })
  public async updateAppointment(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateAppointmentDto,
  ): Promise<AppointmentDto> {
    const appointment = await this.bookingAppointmentsService.updateAppointment(
      this.getTenantId(request),
      id,
      payload,
    );

    return transformToDto(AppointmentDto, {
      ...appointment,
      startsAtIso: appointment.startsAt.toISOString(),
      endsAtIso: appointment.endsAt.toISOString(),
    });
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant in token');
    }

    return tenantId;
  }
}
