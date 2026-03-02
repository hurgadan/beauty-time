import { type ApiClientConfig, ApiHttpClient } from './api-http-client';
import { AuthApiClient } from './auth-api-client';
import { BookingApiClient } from './booking-api-client';
import { ClientsApiClient } from './clients-api-client';
import { CrmApiClient } from './crm-api-client';

export class BeautyTimeApiClient {
  public readonly auth: AuthApiClient;
  public readonly booking: BookingApiClient;
  public readonly crm: CrmApiClient;
  public readonly clients: ClientsApiClient;

  public constructor(config: ApiClientConfig) {
    const http = new ApiHttpClient(config);
    this.auth = new AuthApiClient(http);
    this.booking = new BookingApiClient(http);
    this.crm = new CrmApiClient(http);
    this.clients = new ClientsApiClient(http);
  }
}

export type { ApiClientConfig } from './api-http-client';
