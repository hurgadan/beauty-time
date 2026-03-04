import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClientsService } from './clients.service';
import { AnonymizeClientResponseDto } from './dto/anonymize-client.response.dto';
import { ExportClientDataQueryDto } from './dto/export-client-data.query.dto';
import { ExportClientDataResponseDto } from './dto/export-client-data.response.dto';
import { transformToDto } from '../../_common/transform-to-dto';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.interface';

@ApiTags('public-clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('public/me')
export class PublicClientsController {
  public constructor(
    private readonly clientsService: ClientsService,
    private readonly auditService: AuditService,
  ) {}

  @Get('personal-data-export')
  @ApiOperation({ summary: 'Export current client personal data and booking history (GDPR)' })
  @ApiOkResponse({ type: ExportClientDataResponseDto })
  public async exportPersonalData(
    @Req() request: RequestWithUser,
    @Query() query: ExportClientDataQueryDto,
  ): Promise<ExportClientDataResponseDto> {
    const { tenantId, clientId } = this.getClientContext(request);
    const limit = query.limit ?? 100;

    const { client, visitCount, history } = await this.clientsService.exportClientData(
      tenantId,
      clientId,
      limit,
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
      action: 'clients.public.export_personal_data',
      actorType: 'client',
      actorId: clientId,
      tenantId,
      entityType: 'client',
      entityId: clientId,
      metadata: {
        historyItems: response.history.length,
      },
    });

    return response;
  }

  @Delete('personal-data')
  @ApiOperation({ summary: 'Anonymize current client personal data (GDPR)' })
  @ApiOkResponse({ type: AnonymizeClientResponseDto })
  public async anonymizePersonalData(
    @Req() request: RequestWithUser,
  ): Promise<AnonymizeClientResponseDto> {
    const { tenantId, clientId } = this.getClientContext(request);

    await this.clientsService.anonymizeClient(tenantId, clientId);

    await this.auditService.logFromRequest(request, {
      action: 'clients.public.anonymize_personal_data',
      actorType: 'client',
      actorId: clientId,
      tenantId,
      entityType: 'client',
      entityId: clientId,
    });

    return transformToDto(AnonymizeClientResponseDto, {
      id: clientId,
      anonymized: true,
    });
  }

  private getClientContext(request: RequestWithUser): { tenantId: string; clientId: string } {
    const tenantId = request.user?.tenantId;
    const clientId = request.user?.sub;
    const role = request.user?.role;

    if (!tenantId || !clientId || !role) {
      throw new UnauthorizedException('Missing user in token');
    }

    if (role !== 'client') {
      throw new ForbiddenException('Client token is required');
    }

    return { tenantId, clientId };
  }
}
