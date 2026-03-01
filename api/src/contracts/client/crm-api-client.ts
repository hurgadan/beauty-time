import type {
  ListAppointmentsRequestDto,
  ListAppointmentsResponseDto,
  ListServicesRequestDto,
  ListServicesResponseDto,
} from "../types";
import { ApiHttpClient } from "./api-http-client";

export class CrmApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async listAppointments(
    payload: ListAppointmentsRequestDto,
  ): Promise<ListAppointmentsResponseDto> {
    void payload;
    return this.http.request<ListAppointmentsResponseDto>(
      "/api/crm/appointments",
      {
        method: "GET",
      },
    );
  }

  public async listServices(
    payload: ListServicesRequestDto,
  ): Promise<ListServicesResponseDto> {
    void payload;
    return this.http.request<ListServicesResponseDto>("/api/crm/services", {
      method: "GET",
    });
  }
}
