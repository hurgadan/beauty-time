import type {
  ClientDto,
  GetClientHistoryRequestDto,
  GetClientRequestDto,
  ListClientHistoryResponseDto,
  ListClientsRequestDto,
  ListClientsResponseDto,
} from "../types";
import { ApiHttpClient } from "./api-http-client";

export class ClientsApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async listClients(
    payload: ListClientsRequestDto = {},
  ): Promise<ListClientsResponseDto> {
    const query = new URLSearchParams();
    if (payload.search) {
      query.set("search", payload.search);
    }
    if (payload.limit !== undefined) {
      query.set("limit", String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/crm/clients?${queryString}`
      : "/api/crm/clients";

    return this.http.request<ListClientsResponseDto>(url, { method: "GET" });
  }

  public async getClient(payload: GetClientRequestDto): Promise<ClientDto> {
    return this.http.request<ClientDto>(`/api/crm/clients/${payload.id}`, {
      method: "GET",
    });
  }

  public async getClientHistory(
    payload: GetClientHistoryRequestDto,
  ): Promise<ListClientHistoryResponseDto> {
    const query = new URLSearchParams();
    if (payload.limit !== undefined) {
      query.set("limit", String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/crm/clients/${payload.id}/history?${queryString}`
      : `/api/crm/clients/${payload.id}/history`;

    return this.http.request<ListClientHistoryResponseDto>(url, {
      method: "GET",
    });
  }
}
