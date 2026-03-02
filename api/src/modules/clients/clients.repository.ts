import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type FindOptionsWhere, ILike, In, Repository } from "typeorm";

import { ClientEntity } from "./dao/client.entity";
import { ListClientsQueryDto } from "./dto/list-clients.query.dto";
import { AppointmentEntity } from "../booking/dao/appointment.entity";

@Injectable()
export class ClientsRepository {
  public constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  public async findClientById(
    tenantId: string,
    clientId: string,
  ): Promise<ClientEntity | null> {
    return this.clientRepository.findOneBy({ id: clientId, tenantId });
  }

  public async countClientAppointments(
    tenantId: string,
    clientId: string,
  ): Promise<number> {
    return this.appointmentRepository.countBy({ tenantId, clientId });
  }

  public async findClients(
    tenantId: string,
    query: ListClientsQueryDto,
  ): Promise<ClientEntity[]> {
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    if (!search) {
      return this.clientRepository.find({
        where: { tenantId },
        order: { createdAt: "DESC" },
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
      order: { createdAt: "DESC" },
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
      order: { startsAt: "DESC" },
      take: limit,
    });
  }
}
