import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenantEntity } from './dao/tenant.entity';

@Injectable()
export class TenantRepository {
  public constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  public async findTenantBySlug(slug: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOneBy({ slug });
  }
}
