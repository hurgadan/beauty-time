import type { ListClientHistoryResponseDto as ListClientHistoryResponseDtoContract } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

import { ClientHistoryItemDto } from "./client-history-item.dto";

export class ListClientHistoryResponseDto implements ListClientHistoryResponseDtoContract {
  @ApiProperty({ type: () => [ClientHistoryItemDto] })
  public items!: ClientHistoryItemDto[];
}
