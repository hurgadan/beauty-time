import type { ClientHistoryItemDto } from './client-history-item.type';
import type { ClientDto } from './client.type';

export interface ExportClientDataResponseDto {
  client: ClientDto;
  history: ClientHistoryItemDto[];
  exportedAtIso: string;
}
