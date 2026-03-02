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
  ApiTags,
} from "@nestjs/swagger";

import { CreateServiceRequestDto } from "./dto/create-service.request.dto";
import { ListServicesResponseDto } from "./dto/list-services.response.dto";
import { ServiceResponseDto } from "./dto/service.response.dto";
import { UpdateServiceRequestDto } from "./dto/update-service.request.dto";
import { ServicesService } from "./services.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";

@ApiTags("services")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("crm/services")
export class ServicesController {
  public constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: "List tenant services" })
  @ApiOkResponse({ type: ListServicesResponseDto })
  public async listServices(
    @Req() request: RequestWithUser,
  ): Promise<ListServicesResponseDto> {
    return this.servicesService.listServices(this.getTenantId(request));
  }

  @Post()
  @ApiOperation({ summary: "Create service" })
  @ApiBody({ type: CreateServiceRequestDto })
  @ApiCreatedResponse({ type: ServiceResponseDto })
  public async createService(
    @Req() request: RequestWithUser,
    @Body() payload: CreateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.createService(
      this.getTenantId(request),
      payload,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update service" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateServiceRequestDto })
  @ApiOkResponse({ type: ServiceResponseDto })
  public async updateService(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() payload: UpdateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.updateService(
      this.getTenantId(request),
      id,
      payload,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete service" })
  @ApiParam({ name: "id", type: String })
  @ApiNoContentResponse({ description: "Service deleted" })
  public async deleteService(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.servicesService.deleteService(this.getTenantId(request), id);
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }

    return tenantId;
  }
}
