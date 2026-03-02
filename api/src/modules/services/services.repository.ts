import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceEntity } from './dao/service.entity';

@Injectable()
export class ServicesRepository {
  public constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  public async findServices(tenantId: string): Promise<ServiceEntity[]> {
    return this.serviceRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  public save(entity: Partial<ServiceEntity>): Promise<ServiceEntity> {
    return this.serviceRepository.save(entity);
  }

  public async update(id: string, entity: Partial<ServiceEntity>): Promise<void> {
    await this.serviceRepository.update({ id }, entity);
  }

  public async findServiceById(id: string): Promise<ServiceEntity | null> {
    return this.serviceRepository.findOneBy({ id });
  }

  public async deleteService(id: string): Promise<number> {
    const result = await this.serviceRepository.delete({
      id,
    });
    return result.affected ?? 0;
  }
}
