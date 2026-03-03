import type { CreateServiceDto, UpdateServiceDto } from '@contracts';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ServiceEntity } from './dao/service.entity';
import { ServicesRepository } from './services.repository';

@Injectable()
export class ServicesService {
  public constructor(private readonly servicesRepository: ServicesRepository) {}

  public async listServices(tenantId: string): Promise<ServiceEntity[]> {
    return this.servicesRepository.findServices(tenantId);
  }

  public async createService(tenantId: string, payload: CreateServiceDto): Promise<ServiceEntity> {
    return this.servicesRepository.save({
      tenantId,
      isActive: payload.isActive ?? true,
      bufferBeforeMinutes: payload.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: payload.bufferAfterMinutes ?? 0,
      ...payload,
    });
  }

  public async updateService(
    id: string,
    tenantId: string,
    payload: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    let service = await this.servicesRepository.findServiceById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.tenantId !== tenantId) {
      throw new NotFoundException('Service not found');
    }

    await this.servicesRepository.update(service.id, { ...service, ...payload });

    service = await this.servicesRepository.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  public async deleteService(id: string, tenantId: string): Promise<void> {
    let affected = 0;

    try {
      const service = await this.servicesRepository.findServiceById(id);
      if (!service) {
        return;
      }
      if (service.tenantId !== tenantId) {
        return;
      }
      affected = await this.servicesRepository.deleteService(id);
    } catch (error: unknown) {
      this.handleForeignKeyConstraint(
        error,
        'Service is used in appointments and cannot be deleted',
      );
      throw error;
    }

    if (affected === 0) {
      throw new NotFoundException('Service not found');
    }
  }

  private handleForeignKeyConstraint(error: unknown, message: string): void {
    const code = this.extractPgErrorCode(error);
    if (code === '23503') {
      throw new ConflictException(message);
    }
  }

  private extractPgErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const err = error as Record<string, unknown>;

    if (typeof err['code'] === 'string') return err['code'];

    const driverError = err['driverError'];
    if (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError &&
      typeof (driverError as Record<string, unknown>)['code'] === 'string'
    ) {
      return (driverError as Record<string, unknown>)['code'] as string;
    }

    return undefined;
  }
}
