import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CrmService } from "./crm.service";
import { ListAppointmentsResponseDto } from "./dto/list-appointments.response.dto";
import { ListServicesResponseDto } from "./dto/list-services.response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";

@ApiTags("crm")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("crm")
export class CrmController {
  public constructor(private readonly crmService: CrmService) {}

  @Get("appointments")
  @ApiOperation({ summary: "List tenant appointments" })
  @ApiOkResponse({ type: ListAppointmentsResponseDto })
  public listAppointments(
    @Req() request: RequestWithUser,
  ): ListAppointmentsResponseDto {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }
    return this.crmService.listAppointments(tenantId);
  }

  @Get("services")
  @ApiOperation({ summary: "List tenant services" })
  @ApiOkResponse({ type: ListServicesResponseDto })
  public listServices(
    @Req() request: RequestWithUser,
  ): ListServicesResponseDto {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }
    return this.crmService.listServices(tenantId);
  }
}
