import { ApiProperty } from '@nestjs/swagger';
import type { ServiceListItemDto as ServiceListItemDtoContract } from '../../../contracts';

export class ServiceListItemDto implements ServiceListItemDtoContract {
  @ApiProperty({ example: 'srv_1' })
  public id!: string;

  @ApiProperty({ example: 'tenant_1' })
  public tenantId!: string;

  @ApiProperty({ example: 'Haircut + Styling' })
  public name!: string;

  @ApiProperty({ example: 45 })
  public durationMin!: number;

  @ApiProperty({ example: 49 })
  public priceEur!: number;
}
