import { Injectable, NotFoundException } from '@nestjs/common';

import { TenantEntity } from './dao/tenant.entity';
import { TenantRepository } from './tenant.repository';

@Injectable()
export class TenantService {
  public constructor(private readonly tenantRepository: TenantRepository) {}

  public async findBySlug(slug: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findTenantBySlug(slug);
  }

  public async getBySlugOrThrow(slug: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findTenantBySlug(slug);
    if (!tenant) {
      throw new NotFoundException('Tenant slug not found');
    }

    return tenant;
  }
}
