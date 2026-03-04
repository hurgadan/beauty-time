import { ApiHttpClient } from './api-http-client';
import type { AnonymizeClientResponseDto } from '../../types';
import type { ExportClientDataDto } from '../../types';
import type { ExportClientDataResponseDto } from '../../types';

export class ClientsApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async exportPersonalData(
    payload: ExportClientDataDto = {},
  ): Promise<ExportClientDataResponseDto> {
    const query = new URLSearchParams();

    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/public/me/personal-data-export?${queryString}`
      : '/api/public/me/personal-data-export';

    return this.http.request<ExportClientDataResponseDto>(url, {
      method: 'GET',
    });
  }

  public async anonymizePersonalData(): Promise<AnonymizeClientResponseDto> {
    return this.http.request<AnonymizeClientResponseDto>('/api/public/me/personal-data', {
      method: 'DELETE',
    });
  }
}
