import type {
  ClientDto,
  ClientHistoryItemDto,
  ClientListItemDto,
  ListClientHistoryResponseDto,
  ListClientsResponseDto,
} from "@contracts";
import { Injectable, NotFoundException } from "@nestjs/common";

import { ClientsRepository } from "./clients.repository";
import { ClientEntity } from "./dao/client.entity";
import { ListClientsQueryDto } from "./dto/list-clients.query.dto";
import { AppointmentEntity } from "../booking/dao/appointment.entity";

@Injectable()
export class ClientsService {
  public constructor(private readonly clientsRepository: ClientsRepository) {}

  public async getClient(tenantId: string, id: string): Promise<ClientDto> {
    const client = await this.clientsRepository.findClientById(tenantId, id);

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    const visitCount = await this.clientsRepository.countClientAppointments(
      tenantId,
      id,
    );

    return this.mapClient(client, visitCount);
  }

  public async listClients(
    tenantId: string,
    query: ListClientsQueryDto,
  ): Promise<ListClientsResponseDto> {
    const clients = await this.clientsRepository.findClients(tenantId, query);
    const visitCountMap = await this.getVisitCountMap(
      tenantId,
      clients.map((client) => client.id),
    );

    return {
      items: clients.map((client) =>
        this.mapClientListItem(client, visitCountMap.get(client.id) ?? 0),
      ),
    };
  }

  public async listClientHistory(
    tenantId: string,
    id: string,
    limit: number,
  ): Promise<ListClientHistoryResponseDto> {
    const client = await this.clientsRepository.findClientById(tenantId, id);
    if (!client) {
      throw new NotFoundException("Client not found");
    }

    const appointments = await this.clientsRepository.findClientHistory(
      tenantId,
      id,
      limit,
    );

    return {
      items: appointments.map((appointment) =>
        this.mapClientHistoryItem(appointment),
      ),
    };
  }

  private async getVisitCountMap(
    tenantId: string,
    clientIds: string[],
  ): Promise<Map<string, number>> {
    if (!clientIds.length) {
      return new Map<string, number>();
    }

    const rows = await this.clientsRepository.findAppointmentsByClientIds(
      tenantId,
      clientIds,
    );

    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.clientId, (counts.get(row.clientId) ?? 0) + 1);
    }

    return counts;
  }

  private mapClient(client: ClientEntity, visitCount: number): ClientDto {
    return {
      id: client.id,
      tenantId: client.tenantId,
      firstName: client.firstName,
      lastName: client.lastName,
      salutation: client.salutation,
      gender: client.gender,
      email: client.email,
      phone: client.phone,
      isReturningClient: visitCount > 1,
    };
  }

  private mapClientListItem(
    client: ClientEntity,
    visitCount: number,
  ): ClientListItemDto {
    return {
      id: client.id,
      tenantId: client.tenantId,
      firstName: client.firstName,
      lastName: client.lastName,
      salutation: client.salutation,
      gender: client.gender,
      email: client.email,
      phone: client.phone,
      isReturningClient: visitCount > 1,
    };
  }

  private mapClientHistoryItem(
    appointment: AppointmentEntity,
  ): ClientHistoryItemDto {
    return {
      appointmentId: appointment.id,
      staffId: appointment.staffId,
      serviceId: appointment.serviceId,
      startsAtIso: appointment.startsAt.toISOString(),
      endsAtIso: appointment.endsAt.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
    };
  }
}
