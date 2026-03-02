import type {
  Client,
  ClientHistoryItemDto,
  ClientListItemDto,
  GetClientHistoryRequestDto,
  GetClientRequestDto,
  ListClientsRequestDto,
} from '../types';
import { ApiHttpClient } from './api-http-client';

export class ClientsApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async listClients(payload: ListClientsRequestDto = {}): Promise<ClientListItemDto[]> {
    const query = new URLSearchParams();
    if (payload.search) {
      query.set('search', payload.search);
    }
    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `/api/crm/clients/list?${queryString}` : '/api/crm/clients/list';

    return this.http.request<ClientListItemDto[]>(url, { method: 'GET' });
  }

  public async getClient(payload: GetClientRequestDto): Promise<Client> {
    return this.http.request<Client>(`/api/crm/clients/${payload.id}`, {
      method: 'GET',
    });
  }

  public async getClientHistory(
    payload: GetClientHistoryRequestDto,
  ): Promise<ClientHistoryItemDto[]> {
    const query = new URLSearchParams();
    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/crm/clients/${payload.id}/history?${queryString}`
      : `/api/crm/clients/${payload.id}/history`;

    return this.http.request<ClientHistoryItemDto[]>(url, {
      method: 'GET',
    });
  }
}
