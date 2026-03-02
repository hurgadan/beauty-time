import type {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from "@contracts";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ServiceEntity } from "./dao/service.entity";

@Injectable()
export class ServicesRepository {
  public constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  public async findServices(tenantId: string): Promise<ServiceEntity[]> {
    return this.serviceRepository.find({
      where: { tenantId },
      order: { name: "ASC" },
    });
  }

  public createService(
    tenantId: string,
    payload: CreateServiceRequestDto,
  ): ServiceEntity {
    return this.serviceRepository.create({
      tenantId,
      name: payload.name,
      description: payload.description ?? null,
      priceCents: payload.priceCents,
      durationMinutes: payload.durationMinutes,
      bufferBeforeMinutes: payload.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: payload.bufferAfterMinutes ?? 0,
      isActive: payload.isActive ?? true,
    });
  }

  public async saveService(service: ServiceEntity): Promise<ServiceEntity> {
    return this.serviceRepository.save(service);
  }

  public async findServiceById(
    tenantId: string,
    serviceId: string,
  ): Promise<ServiceEntity | null> {
    return this.serviceRepository.findOneBy({ id: serviceId, tenantId });
  }

  public applyServiceUpdate(
    service: ServiceEntity,
    payload: UpdateServiceRequestDto,
  ): ServiceEntity {
    if (payload.name !== undefined) {
      service.name = payload.name;
    }
    if (payload.description !== undefined) {
      service.description = payload.description;
    }
    if (payload.priceCents !== undefined) {
      service.priceCents = payload.priceCents;
    }
    if (payload.durationMinutes !== undefined) {
      service.durationMinutes = payload.durationMinutes;
    }
    if (payload.bufferBeforeMinutes !== undefined) {
      service.bufferBeforeMinutes = payload.bufferBeforeMinutes;
    }
    if (payload.bufferAfterMinutes !== undefined) {
      service.bufferAfterMinutes = payload.bufferAfterMinutes;
    }
    if (payload.isActive !== undefined) {
      service.isActive = payload.isActive;
    }

    return service;
  }

  public async deleteService(
    tenantId: string,
    serviceId: string,
  ): Promise<number> {
    const result = await this.serviceRepository.delete({
      id: serviceId,
      tenantId,
    });
    return result.affected ?? 0;
  }
}
