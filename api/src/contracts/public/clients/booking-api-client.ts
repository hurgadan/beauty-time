import { ApiHttpClient } from './api-http-client';
import type { AvailabilityQueryResponseDto } from '../../types';
import type { AvailabilityQueryDto } from '../../types';
import type { BookingConfigResponseDto } from '../../types';
import type { ConfirmAppointmentResponseDto } from '../../types';
import type { ConfirmAppointmentDto } from '../../types';
import type { CreatePublicAppointmentResponseDto } from '../../types';
import type { CreatePublicAppointmentDto } from '../../types';

export class BookingApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async getBookingConfig(tenantSlug: string): Promise<BookingConfigResponseDto> {
    return this.http.request<BookingConfigResponseDto>(`/api/book/${tenantSlug}/config`, {
      method: 'GET',
    });
  }

  public async queryAvailability(
    tenantSlug: string,
    payload: AvailabilityQueryDto,
  ): Promise<AvailabilityQueryResponseDto> {
    return this.http.request<AvailabilityQueryResponseDto>(
      `/api/book/${tenantSlug}/availability/query`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  public async createPublicAppointment(
    tenantSlug: string,
    payload: CreatePublicAppointmentDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    return this.http.request<CreatePublicAppointmentResponseDto>(
      `/api/book/${tenantSlug}/appointments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  public async confirmAppointment(
    payload: ConfirmAppointmentDto,
  ): Promise<ConfirmAppointmentResponseDto> {
    return this.http.request<ConfirmAppointmentResponseDto>(
      `/api/book/appointments/${payload.id}/confirm`,
      {
        method: 'POST',
      },
    );
  }
}
