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

import { CreateServiceRequestDto } from './dto/create-service.request.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceRequestDto } from './dto/update-service.request.dto';
import { ServicesService } from './services.service';
import { transformToDto } from '../../_common/transform-to-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/services')
export class ServicesController {
  public constructor(private readonly servicesService: ServicesService) {}

  @Get('list')
  @ApiOperation({ summary: 'List tenant services' })
  @ApiOkResponse({ type: ServiceDto, isArray: true })
  public async listServices(@Req() request: RequestWithUser): Promise<ServiceDto[]> {
    const services = await this.servicesService.listServices(this.getTenantId(request));

    return services.map((service) => transformToDto(ServiceDto, service));
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiBody({ type: CreateServiceRequestDto })
  @ApiCreatedResponse({ type: ServiceDto })
  public async createService(
    @Req() request: RequestWithUser,
    @Body() payload: CreateServiceRequestDto,
  ): Promise<ServiceDto> {
    const service = await this.servicesService.createService(this.getTenantId(request), payload);

    return transformToDto(ServiceDto, service);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateServiceRequestDto })
  @ApiOkResponse({ type: ServiceDto })
  public async updateService(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateServiceRequestDto,
  ): Promise<ServiceDto> {
    const service = await this.servicesService.updateService(
      id,
      this.getTenantId(request),
      payload,
    );

    return transformToDto(ServiceDto, service);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Service deleted' })
  public async deleteService(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.servicesService.deleteService(id, this.getTenantId(request));
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant in token');
    }

    return tenantId;
  }
}
