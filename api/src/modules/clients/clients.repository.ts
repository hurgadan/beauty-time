import { ClientGender, ClientSalutation } from '@contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, In, Repository } from 'typeorm';

import { ClientEntity } from './dao/client.entity';
import { ListClientsQueryDto } from './dto/list-clients.query.dto';
import { AppointmentEntity } from '../booking/dao/appointment.entity';

@Injectable()
export class ClientsRepository {
  public constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  public async findClientById(tenantId: string, clientId: string): Promise<ClientEntity | null> {
    return this.clientRepository.findOneBy({ id: clientId, tenantId });
  }

  public async findClientByEmail(tenantId: string, email: string): Promise<ClientEntity | null> {
    return this.clientRepository.findOneBy({ tenantId, email });
  }

  public createClient(tenantId: string, email: string, fullName?: string): ClientEntity {
    const { firstName, lastName } = fullName
      ? splitClientName(fullName)
      : buildNameFromEmail(email);

    return this.clientRepository.create({
      tenantId,
      email,
      firstName,
      lastName,
      salutation: ClientSalutation.NONE,
      gender: ClientGender.UNSPECIFIED,
      phone: null,
    });
  }

  public async saveClient(client: ClientEntity): Promise<ClientEntity> {
    return this.clientRepository.save(client);
  }

  public async countClientAppointments(tenantId: string, clientId: string): Promise<number> {
    return this.appointmentRepository.countBy({ tenantId, clientId });
  }

  public async findClients(tenantId: string, query: ListClientsQueryDto): Promise<ClientEntity[]> {
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    if (!search) {
      return this.clientRepository.find({
        where: { tenantId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }

    const searchPattern = `%${search}%`;
    const filters: FindOptionsWhere<ClientEntity>[] = [
      { tenantId, firstName: ILike(searchPattern) },
      { tenantId, lastName: ILike(searchPattern) },
      { tenantId, email: ILike(searchPattern) },
      { tenantId, phone: ILike(searchPattern) },
    ];

    return this.clientRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  public async findAppointmentsByClientIds(
    tenantId: string,
    clientIds: string[],
  ): Promise<AppointmentEntity[]> {
    if (!clientIds.length) {
      return [];
    }

    return this.appointmentRepository.find({
      select: { clientId: true },
      where: {
        tenantId,
        clientId: In(clientIds),
      },
    });
  }

  public async findClientHistory(
    tenantId: string,
    clientId: string,
    limit: number,
  ): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({
      where: { tenantId, clientId },
      order: { startsAt: 'DESC' },
      take: limit,
    });
  }
}

function buildNameFromEmail(email: string): { firstName: string; lastName: string } {
  const localPart = email.split('@')[0] ?? 'Client';
  const cleaned = localPart.replace(/[^a-zA-Z0-9._-]/g, ' ').trim();
  if (!cleaned) {
    return { firstName: 'Client', lastName: '' };
  }

  const chunks = cleaned
    .split(/[._\-\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!chunks.length) {
    return { firstName: 'Client', lastName: '' };
  }

  const firstName = toTitleCase(chunks[0] ?? 'Client');
  const lastName = chunks.slice(1).map(toTitleCase).join(' ');
  return { firstName, lastName };
}

function toTitleCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function splitClientName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: 'Client', lastName: '-' };
  }

  const parts = normalized.split(' ');
  const firstName = parts[0] ?? 'Client';
  const lastName = parts.slice(1).join(' ') || '-';

  return { firstName, lastName };
}
