import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { ClientsService } from "./clients.service";
import { ClientResponseDto } from "./dto/client.response.dto";
import { ListClientHistoryQueryDto } from "./dto/list-client-history.query.dto";
import { ListClientHistoryResponseDto } from "./dto/list-client-history.response.dto";
import { ListClientsQueryDto } from "./dto/list-clients.query.dto";
import { ListClientsResponseDto } from "./dto/list-clients.response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";

@ApiTags("clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("crm/clients")
export class ClientsController {
  public constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "List tenant clients" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ type: ListClientsResponseDto })
  public async listClients(
    @Req() request: RequestWithUser,
    @Query() query: ListClientsQueryDto,
  ): Promise<ListClientsResponseDto> {
    return this.clientsService.listClients(this.getTenantId(request), query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get client card by id" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ type: ClientResponseDto })
  public async getClient(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ClientResponseDto> {
    return this.clientsService.getClient(this.getTenantId(request), id);
  }

  @Get(":id/history")
  @ApiOperation({ summary: "List client appointment history" })
  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ type: ListClientHistoryResponseDto })
  public async listClientHistory(
    @Req() request: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ListClientHistoryQueryDto,
  ): Promise<ListClientHistoryResponseDto> {
    return this.clientsService.listClientHistory(
      this.getTenantId(request),
      id,
      query.limit ?? 20,
    );
  }

  private getTenantId(request: RequestWithUser): string {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }
    return tenantId;
  }
}
