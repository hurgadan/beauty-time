import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { BookingService } from "./booking.service";
import { AvailabilityQueryRequestDto } from "./dto/availability-query.request.dto";
import { AvailabilityQueryResponseDto } from "./dto/availability-query.response.dto";
import { BookingConfigResponseDto } from "./dto/booking-config.response.dto";
import { ConfirmAppointmentResponseDto } from "./dto/confirm-appointment.response.dto";
import { CreatePublicAppointmentRequestDto } from "./dto/create-public-appointment.request.dto";
import { CreatePublicAppointmentResponseDto } from "./dto/create-public-appointment.response.dto";

@ApiTags("book")
@Controller("book")
export class BookingController {
  public constructor(private readonly bookingService: BookingService) {}

  @Get(":bookingSlug/config")
  @ApiOperation({ summary: "Get public booking config" })
  @ApiParam({ name: "bookingSlug", type: String })
  @ApiOkResponse({ type: BookingConfigResponseDto })
  public getConfig(
    @Param("bookingSlug") bookingSlug: string,
  ): BookingConfigResponseDto {
    return this.bookingService.getConfig(bookingSlug);
  }

  @Post(":bookingSlug/availability/query")
  @ApiOperation({ summary: "Query available booking slots" })
  @ApiParam({ name: "bookingSlug", type: String })
  @ApiBody({ type: AvailabilityQueryRequestDto })
  @ApiOkResponse({ type: AvailabilityQueryResponseDto })
  public queryAvailability(
    @Param("bookingSlug") bookingSlug: string,
    @Body() dto: AvailabilityQueryRequestDto,
  ): AvailabilityQueryResponseDto {
    void dto;

    return {
      bookingSlug,
      slots: this.bookingService.listAvailability(),
    };
  }

  @Post(":bookingSlug/appointments")
  @ApiOperation({ summary: "Create appointment from public booking flow" })
  @ApiParam({ name: "bookingSlug", type: String })
  @ApiBody({ type: CreatePublicAppointmentRequestDto })
  @ApiOkResponse({ type: CreatePublicAppointmentResponseDto })
  public createAppointment(
    @Param("bookingSlug") bookingSlug: string,
    @Body() dto: CreatePublicAppointmentRequestDto,
  ): CreatePublicAppointmentResponseDto {
    void dto;

    return this.bookingService.createPublicAppointment(bookingSlug);
  }

  @Post("appointments/:id/confirm")
  @ApiOperation({ summary: "Confirm appointment from reminder link" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ type: ConfirmAppointmentResponseDto })
  public confirmAppointment(
    @Param("id") id: string,
  ): ConfirmAppointmentResponseDto {
    return this.bookingService.confirmAppointment(id);
  }
}
