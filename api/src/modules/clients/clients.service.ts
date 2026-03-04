import type { Client } from '@contracts';
import { Injectable, NotFoundException } from '@nestjs/common';

import { ClientsRepository } from './clients.repository';
import { ClientEntity } from './dao/client.entity';
import { ListClientsQueryDto } from './dto/list-clients.query.dto';
import { AppointmentEntity } from '../booking/dao/appointment.entity';

@Injectable()
export class ClientsService {
  public constructor(private readonly clientsRepository: ClientsRepository) {}

  public async getClient(
    tenantId: string,
    id: string,
  ): Promise<{ client: ClientEntity; visitCount: number }> {
    const client = await this.clientsRepository.findClientById(tenantId, id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const visitCount = await this.clientsRepository.countClientAppointments(tenantId, id);

    return { client, visitCount };
  }

  public async getClientOptional(tenantId: string, id: string): Promise<ClientEntity | null> {
    return this.clientsRepository.findClientById(tenantId, id);
  }

  public async listClients(
    tenantId: string,
    query: ListClientsQueryDto,
  ): Promise<Array<{ client: ClientEntity; visitCount: number }>> {
    const clients = await this.clientsRepository.findClients(tenantId, query);
    const visitCountMap = await this.getVisitCountMap(
      tenantId,
      clients.map((client) => client.id),
    );

    return clients.map((client) => ({
      client,
      visitCount: visitCountMap.get(client.id) ?? 0,
    }));
  }

  public async listClientHistory(
    tenantId: string,
    id: string,
    limit: number,
  ): Promise<AppointmentEntity[]> {
    const client = await this.clientsRepository.findClientById(tenantId, id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.clientsRepository.findClientHistory(tenantId, id, limit);
  }

  public async findByEmail(tenantId: string, email: string): Promise<ClientEntity | null> {
    return this.clientsRepository.findClientByEmail(tenantId, email);
  }

  public async findOrCreateByEmail(
    tenantId: string,
    email: string,
    fullName?: string,
  ): Promise<ClientEntity> {
    const existing = await this.clientsRepository.findClientByEmail(tenantId, email);
    if (existing) {
      return existing;
    }

    const created = this.clientsRepository.createClient(tenantId, email, fullName);
    return this.clientsRepository.saveClient(created);
  }

  public async exportClientData(
    tenantId: string,
    clientId: string,
    limit = 100,
  ): Promise<{ client: ClientEntity; visitCount: number; history: AppointmentEntity[] }> {
    const { client, visitCount } = await this.getClient(tenantId, clientId);
    const history = await this.clientsRepository.findClientHistory(tenantId, clientId, limit);

    return {
      client,
      visitCount,
      history,
    };
  }

  public async anonymizeClient(tenantId: string, clientId: string): Promise<void> {
    const client = await this.clientsRepository.findClientById(tenantId, clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const anonymizedEmail = `anonymized+${clientId}@deleted.local`;
    await this.clientsRepository.anonymizeClient(tenantId, clientId, anonymizedEmail);
  }

  private async getVisitCountMap(
    tenantId: string,
    clientIds: string[],
  ): Promise<Map<string, number>> {
    if (!clientIds.length) {
      return new Map<string, number>();
    }

    const rows = await this.clientsRepository.findAppointmentsByClientIds(tenantId, clientIds);

    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.clientId, (counts.get(row.clientId) ?? 0) + 1);
    }

    return counts;
  }

  public toClientDto(client: ClientEntity, visitCount: number): Client {
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
}
