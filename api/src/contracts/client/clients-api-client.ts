import type { ClientDto, GetClientRequestDto } from "../types";
import { ApiHttpClient } from "./api-http-client";

export class ClientsApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async getClient(payload: GetClientRequestDto): Promise<ClientDto> {
    return this.http.request<ClientDto>(`/api/clients/${payload.id}`, {
      method: "GET",
    });
  }
}
