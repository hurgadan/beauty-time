import type { ListClientsResponseDto as ListClientsResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { ClientListItemDto } from "./client-list-item.dto";

export class ListClientsResponseDto implements ListClientsResponseDtoContract {
  @ApiProperty({ type: () => [ClientListItemDto] })
  public items!: ClientListItemDto[];
}
