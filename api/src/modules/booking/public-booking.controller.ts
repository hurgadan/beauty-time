import { BookingService } from '@modules/booking/booking.service';
import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { RateLimit } from '../../_common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../_common/guards/rate-limit.guard';
import { AuditService } from '../audit/audit.service';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';
import { AvailabilityQueryDto } from './dto/public/availability-query.dto';
import { AvailabilityQueryResponseDto } from './dto/public/availability-query.response.dto';
import { BookingConfigResponseDto } from './dto/public/booking-config.response.dto';
import { ConfirmAppointmentResponseDto } from './dto/public/confirm-appointment.response.dto';
import { CreatePublicAppointmentDto } from './dto/public/create-public-appointment.dto';
import { CreatePublicAppointmentResponseDto } from './dto/public/create-public-appointment.response.dto';

@ApiTags('book')
@UseGuards(RateLimitGuard)
@Controller('book')
export class PublicBookingController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly auditService: AuditService,
  ) {}

  @Get(':tenantSlug/config')
  @RateLimit({ key: 'public-booking-config', maxRequests: 120, windowSeconds: 60 })
  @ApiOperation({ summary: 'Get public booking config' })
  @ApiParam({ name: 'tenantSlug', type: String })
  @ApiOkResponse({ type: BookingConfigResponseDto })
  public async getConfig(
    @Param('tenantSlug') tenantSlug: string,
  ): Promise<BookingConfigResponseDto> {
    return this.bookingService.getConfig(tenantSlug);
  }

  @Post(':tenantSlug/availability/query')
  @RateLimit({ key: 'public-booking-availability-query', maxRequests: 60, windowSeconds: 60 })
  @HttpCode(200)
  @ApiOperation({ summary: 'Query available booking slots' })
  @ApiParam({ name: 'tenantSlug', type: String })
  @ApiBody({ type: AvailabilityQueryDto })
  @ApiOkResponse({ type: AvailabilityQueryResponseDto })
  public async queryAvailability(
    @Param('tenantSlug') tenantSlug: string,
    @Body() dto: AvailabilityQueryDto,
  ): Promise<AvailabilityQueryResponseDto> {
    const slots = await this.bookingService.listAvailability(tenantSlug, dto);

    return {
      tenantSlug,
      slots,
    };
  }

  @Post(':tenantSlug/appointments')
  @RateLimit({ key: 'public-booking-create-appointment', maxRequests: 20, windowSeconds: 60 })
  @ApiOperation({ summary: 'Create appointment from public booking flow' })
  @ApiParam({ name: 'tenantSlug', type: String })
  @ApiBody({ type: CreatePublicAppointmentDto })
  @ApiOkResponse({ type: CreatePublicAppointmentResponseDto })
  public createAppointment(
    @Req() request: RequestWithUser,
    @Param('tenantSlug') tenantSlug: string,
    @Body() dto: CreatePublicAppointmentDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    return this.createAndAudit(request, tenantSlug, dto);
  }

  @Post('appointments/:id/confirm')
  @RateLimit({ key: 'public-booking-confirm-appointment', maxRequests: 30, windowSeconds: 60 })
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm appointment from reminder link' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ConfirmAppointmentResponseDto })
  public async confirmAppointment(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ConfirmAppointmentResponseDto> {
    const result = await this.bookingService.confirmAppointment({ id });
    await this.auditService.logFromRequest(request, {
      action: 'booking.public.confirm_appointment',
      actorType: 'client',
      entityType: 'appointment',
      entityId: result.id,
      metadata: {
        status: result.status,
      },
    });

    return result;
  }

  private async createAndAudit(
    request: RequestWithUser,
    tenantSlug: string,
    dto: CreatePublicAppointmentDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    const result = await this.bookingService.createPublicAppointment(tenantSlug, dto);
    await this.auditService.logFromRequest(request, {
      action: 'booking.public.create_appointment',
      actorType: 'public',
      entityType: 'appointment',
      entityId: result.id,
      metadata: {
        tenantSlug,
        serviceId: dto.serviceId,
        staffId: dto.staffId ?? null,
      },
    });

    return result;
  }
}
