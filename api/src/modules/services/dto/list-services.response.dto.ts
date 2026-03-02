import type { ListServicesResponseDto as ListServicesResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { ServiceListItemDto } from "./service-list-item.dto";

export class ListServicesResponseDto implements ListServicesResponseDtoContract {
  @ApiProperty({ type: () => [ServiceListItemDto] })
  public items!: ServiceListItemDto[];
}
