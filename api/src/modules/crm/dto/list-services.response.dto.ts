import { ApiProperty } from '@nestjs/swagger';
import type { ListServicesResponseDto as ListServicesResponseDtoContract } from '../../../contracts';
import { ServiceListItemDto } from './service-list-item.dto';

export class ListServicesResponseDto implements ListServicesResponseDtoContract {
  @ApiProperty({ type: () => [ServiceListItemDto] })
  public items!: ServiceListItemDto[];
}
