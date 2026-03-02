import type {
  CreateServiceRequestDto,
  ListServicesResponseDto,
  ServiceResponseDto,
  UpdateServiceRequestDto,
} from "@contracts";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ServiceEntity } from "./dao/service.entity";
import { ServicesRepository } from "./services.repository";

@Injectable()
export class ServicesService {
  public constructor(private readonly servicesRepository: ServicesRepository) {}

  public async listServices(
    tenantId: string,
  ): Promise<ListServicesResponseDto> {
    const items = await this.servicesRepository.findServices(tenantId);

    return {
      items: items.map((service) => this.mapService(service)),
    };
  }

  public async createService(
    tenantId: string,
    payload: CreateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    const service = this.servicesRepository.createService(tenantId, payload);
    const saved = await this.servicesRepository.saveService(service);
    return this.mapService(saved);
  }

  public async updateService(
    tenantId: string,
    serviceId: string,
    payload: UpdateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findServiceById(
      tenantId,
      serviceId,
    );

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const updated = this.servicesRepository.applyServiceUpdate(
      service,
      payload,
    );
    const saved = await this.servicesRepository.saveService(updated);
    return this.mapService(saved);
  }

  public async deleteService(tenantId: string, serviceId: string): Promise<void> {
    let affected = 0;

    try {
      affected = await this.servicesRepository.deleteService(tenantId, serviceId);
    } catch (error: unknown) {
      this.handleForeignKeyConstraint(
        error,
        "Service is used in appointments and cannot be deleted",
      );
      throw error;
    }

    if (affected === 0) {
      throw new NotFoundException("Service not found");
    }
  }

  private mapService(service: ServiceEntity): ServiceResponseDto {
    return {
      id: service.id,
      tenantId: service.tenantId,
      name: service.name,
      description: service.description,
      priceCents: service.priceCents,
      durationMinutes: service.durationMinutes,
      bufferBeforeMinutes: service.bufferBeforeMinutes,
      bufferAfterMinutes: service.bufferAfterMinutes,
      isActive: service.isActive,
    };
  }

  private handleForeignKeyConstraint(error: unknown, message: string): void {
    const code = this.extractPgErrorCode(error);
    if (code === "23503") {
      throw new ConflictException(message);
    }
  }

  private extractPgErrorCode(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null) return undefined;

    const err = error as Record<string, unknown>;

    if (typeof err["code"] === "string") return err["code"];

    const driverError = err["driverError"];
    if (
      typeof driverError === "object" &&
      driverError !== null &&
      "code" in driverError &&
      typeof (driverError as Record<string, unknown>)["code"] === "string"
    ) {
      return (driverError as Record<string, unknown>)["code"] as string;
    }

    return undefined;
  }
}
