import type { ExportClientDataResponseDto as ExportClientDataResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ClientHistoryItemDto } from './client-history-item.dto';
import { ClientResponseDto } from './client.response.dto';

export class ExportClientDataResponseDto implements ExportClientDataResponseDtoContract {
  @Expose()
  @Type(() => ClientResponseDto)
  @ApiProperty({ type: ClientResponseDto })
  public client!: ClientResponseDto;

  @Expose()
  @Type(() => ClientHistoryItemDto)
  @ApiProperty({ type: ClientHistoryItemDto, isArray: true })
  public history!: ClientHistoryItemDto[];

  @Expose()
  @ApiProperty({ example: '2026-03-04T15:20:30.000Z' })
  public exportedAtIso!: string;
}
