import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ClientsService } from './clients.service';
import { AnonymizeClientResponseDto } from './dto/anonymize-client.response.dto';
import { ClientHistoryItemDto } from './dto/client-history-item.dto';
import { ClientListItemDto } from './dto/client-list-item.dto';
import { ClientResponseDto } from './dto/client.response.dto';
import { ExportClientDataQueryDto } from './dto/export-client-data.query.dto';
import { ExportClientDataResponseDto } from './dto/export-client-data.response.dto';
import { ListClientHistoryQueryDto } from './dto/list-client-history.query.dto';
import { ListClientsQueryDto } from './dto/list-clients.query.dto';
import { transformToDto } from '../../_common/transform-to-dto';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/clients')
export class CrmClientsController {
  public constructor(
    private readonly clientsService: ClientsService,
    private readonly auditService: AuditService,
  ) {}

  @Get('list')
  @ApiOperation({ summary: 'List tenant clients' })
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

  @Get(':id/export')
  @ApiOperation({ summary: 'Export client personal data and appointment history (GDPR)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ExportClientDataResponseDto })
  public async exportClientData(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ExportClientDataQueryDto,
  ): Promise<ExportClientDataResponseDto> {
    const { client, visitCount, history } = await this.clientsService.exportClientData(
      this.getTenantId(request),
      id,
      query.limit ?? 100,
    );

    const response = transformToDto(ExportClientDataResponseDto, {
      client: this.clientsService.toClientDto(client, visitCount),
      history: history.map((appointment) => ({
        appointmentId: appointment.id,
        staffId: appointment.staffId,
        serviceId: appointment.serviceId,
        startsAtIso: appointment.startsAt.toISOString(),
        endsAtIso: appointment.endsAt.toISOString(),
        status: appointment.status,
        notes: appointment.notes,
      })),
      exportedAtIso: new Date().toISOString(),
    });

    await this.auditService.logFromRequest(request, {
      action: 'clients.crm.export_client_data',
      entityType: 'client',
      entityId: id,
      metadata: {
        historyItems: response.history.length,
      },
    });

    return response;
  }

  @Delete(':id/personal-data')
  @ApiOperation({ summary: 'Anonymize client personal data (GDPR)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: AnonymizeClientResponseDto })
  public async anonymizeClientData(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AnonymizeClientResponseDto> {
    await this.clientsService.anonymizeClient(this.getTenantId(request), id);

    await this.auditService.logFromRequest(request, {
      action: 'clients.crm.anonymize_client_data',
      entityType: 'client',
      entityId: id,
    });

    return transformToDto(AnonymizeClientResponseDto, { id, anonymized: true });
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant in token');
    }
    return tenantId;
  }
}
