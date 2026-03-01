import type {
  AvailabilityQueryResponseDto,
  BookingConfigResponseDto,
  ConfirmAppointmentRequestEnvelopeDto,
  ConfirmAppointmentResponseDto,
  CreatePublicAppointmentRequestEnvelopeDto,
  CreatePublicAppointmentResponseDto,
  GetBookingConfigRequestDto,
  QueryAvailabilityRequestEnvelopeDto,
} from '../types';
import { ApiHttpClient } from './api-http-client';

export class BookingApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async getBookingConfig(payload: GetBookingConfigRequestDto): Promise<BookingConfigResponseDto> {
    return this.http.request<BookingConfigResponseDto>(`/api/book/${payload.bookingSlug}/config`, { method: 'GET' });
  }

  public async queryAvailability(payload: QueryAvailabilityRequestEnvelopeDto): Promise<AvailabilityQueryResponseDto> {
    return this.http.request<AvailabilityQueryResponseDto>(`/api/book/${payload.bookingSlug}/availability/query`, {
      method: 'POST',
      body: JSON.stringify(payload.payload),
    });
  }

  public async createPublicAppointment(
    payload: CreatePublicAppointmentRequestEnvelopeDto,
  ): Promise<CreatePublicAppointmentResponseDto> {
    return this.http.request<CreatePublicAppointmentResponseDto>(`/api/book/${payload.bookingSlug}/appointments`, {
      method: 'POST',
      body: JSON.stringify(payload.payload),
    });
  }

  public async confirmAppointment(
    payload: ConfirmAppointmentRequestEnvelopeDto,
  ): Promise<ConfirmAppointmentResponseDto> {
    return this.http.request<ConfirmAppointmentResponseDto>(`/api/book/appointments/${payload.payload.id}/confirm`, {
      method: 'POST',
    });
  }
}
