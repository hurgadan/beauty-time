import { BookingService } from '@modules/booking/booking.service';
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AvailabilityQueryDto } from './dto/public/availability-query.dto';
import { AvailabilityQueryResponseDto } from './dto/public/availability-query.response.dto';
import { BookingConfigResponseDto } from './dto/public/booking-config.response.dto';
import { ConfirmAppointmentResponseDto } from './dto/public/confirm-appointment.response.dto';
import { CreatePublicAppointmentDto } from './dto/public/create-public-appointment.dto';
import { CreatePublicAppointmentResponseDto } from './dto/public/create-public-appointment.response.dto';

@ApiTags('book')
@Controller('book')
export class PublicBookingController {
  public constructor(private readonly bookingService: BookingService) {}

  @Get(':tenantSlug/config')
  @ApiOperation({ summary: 'Get public booking config' })
  @ApiParam({ name: 'tenantSlug', type: String })
  @ApiOkResponse({ type: BookingConfigResponseDto })
  public async getConfig(
    @Param('tenantSlug') tenantSlug: string,
  ): Promise<BookingConfigResponseDto> {
    return this.bookingService.getConfig(tenantSlug);
  }

  @Post(':tenantSlug/availability/query')
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
  @ApiOperation({ summary: 'Create appointment from public booking flow' })
  @ApiParam({ name: 'tenantSlug', type: String })
  @ApiBody({ type: CreatePublicAppointmentDto })
  @ApiOkResponse({ type: CreatePublicAppointmentResponseDto })
  public createAppointment(
    @Param('tenantSlug') tenantSlug: string,
    @Body() dto: CreatePublicAppointmentDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    return this.bookingService.createPublicAppointment(tenantSlug, dto);
  }

  @Post('appointments/:id/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm appointment from reminder link' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ConfirmAppointmentResponseDto })
  public async confirmAppointment(@Param('id') id: string): Promise<ConfirmAppointmentResponseDto> {
    return this.bookingService.confirmAppointment({ id });
  }
}
