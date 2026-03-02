import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ClientsService } from './clients.service';
import { ClientHistoryItemDto } from './dto/client-history-item.dto';
import { ClientListItemDto } from './dto/client-list-item.dto';
import { ClientResponseDto } from './dto/client.response.dto';
import { ListClientHistoryQueryDto } from './dto/list-client-history.query.dto';
import { ListClientsQueryDto } from './dto/list-clients.query.dto';
import { transformToDto } from '../../_common/transform-to-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/clients')
export class ClientsController {
  public constructor(private readonly clientsService: ClientsService) {}

  @Get('list')
  @ApiOperation({ summary: 'List tenant clients' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ClientListItemDto, isArray: true })
  public async listClients(
    @Req() request: RequestWithUser,
    @Query() query: ListClientsQueryDto,
  ): Promise<ClientListItemDto[]> {
    const clients = await this.clientsService.listClients(this.getTenantId(request), query);

    return clients.map(({ client, visitCount }) =>
      transformToDto(ClientListItemDto, this.clientsService.toClientDto(client, visitCount)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client card by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ClientResponseDto })
  public async getClient(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClientResponseDto> {
    const { client, visitCount } = await this.clientsService.getClient(
      this.getTenantId(request),
      id,
    );

    return transformToDto(ClientResponseDto, this.clientsService.toClientDto(client, visitCount));
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'List client appointment history' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ClientHistoryItemDto, isArray: true })
  public async listClientHistory(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListClientHistoryQueryDto,
  ): Promise<ClientHistoryItemDto[]> {
    const appointments = await this.clientsService.listClientHistory(
      this.getTenantId(request),
      id,
      query.limit ?? 20,
    );

    return appointments.map((appointment) =>
      transformToDto(ClientHistoryItemDto, {
        appointmentId: appointment.id,
        staffId: appointment.staffId,
        serviceId: appointment.serviceId,
        startsAtIso: appointment.startsAt.toISOString(),
        endsAtIso: appointment.endsAt.toISOString(),
        status: appointment.status,
        notes: appointment.notes,
      }),
    );
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant in token');
    }
    return tenantId;
  }
}
