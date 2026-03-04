import {
  ApiHttpClient,
  AuthApiClient,
  BookingApiClient,
} from "@hurgadan/beauty-time-public-contracts";
import type {
  AvailabilityQueryDto,
  AvailabilitySlotDto,
  BookingConfigResponseDto,
  ConfirmAppointmentResponseDto,
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
  SendMagicLinkDto,
  SendMagicLinkResponseDto,
  VerifyOtpDto,
  VerifyOtpResponseDto,
} from "@hurgadan/beauty-time-public-contracts";

export interface ExportPersonalDataResponse {
  client: {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    isReturningClient: boolean;
  };
  history: Array<{
    appointmentId: string;
    staffId: string;
    serviceId: string;
    startsAtIso: string;
    endsAtIso: string;
    status: string;
    notes: string | null;
  }>;
  exportedAtIso: string;
}

export interface AnonymizePersonalDataResponse {
  id: string;
  anonymized: boolean;
}

export function useBookingApi(): {
  getBookingConfig: (tenantSlug: string) => Promise<BookingConfigResponseDto>;
  queryAvailability: (
    tenantSlug: string,
    payload: AvailabilityQueryDto,
  ) => Promise<AvailabilitySlotDto[]>;
  createPublicAppointment: (
    tenantSlug: string,
    payload: CreatePublicAppointmentDto,
  ) => Promise<CreatePublicAppointmentResponseDto>;
  sendMagicLink: (
    payload: SendMagicLinkDto,
  ) => Promise<SendMagicLinkResponseDto>;
  verifyOtp: (payload: VerifyOtpDto) => Promise<VerifyOtpResponseDto>;
  confirmAppointment: (
    appointmentId: string,
  ) => Promise<ConfirmAppointmentResponseDto>;
  exportPersonalData: (
    accessToken: string,
    limit?: number,
  ) => Promise<ExportPersonalDataResponse>;
  anonymizePersonalData: (
    accessToken: string,
  ) => Promise<AnonymizePersonalDataResponse>;
} {
  const runtimeConfig = useRuntimeConfig();

  function createClients(): { auth: AuthApiClient; booking: BookingApiClient } {
    const http = new ApiHttpClient({
      baseUrl: runtimeConfig.public.apiBaseUrl,
    });

    return {
      auth: new AuthApiClient(http),
      booking: new BookingApiClient(http),
    };
  }

  return {
    async getBookingConfig(
      tenantSlug: string,
    ): Promise<BookingConfigResponseDto> {
      return createClients().booking.getBookingConfig(tenantSlug);
    },
    async queryAvailability(
      tenantSlug: string,
      payload: AvailabilityQueryDto,
    ): Promise<AvailabilitySlotDto[]> {
      const response = await createClients().booking.queryAvailability(
        tenantSlug,
        payload,
      );
      return response.slots;
    },
    async createPublicAppointment(
      tenantSlug: string,
      payload: CreatePublicAppointmentDto,
    ): Promise<CreatePublicAppointmentResponseDto> {
      return createClients().booking.createPublicAppointment(
        tenantSlug,
        payload,
      );
    },
    async sendMagicLink(
      payload: SendMagicLinkDto,
    ): Promise<SendMagicLinkResponseDto> {
      return createClients().auth.sendMagicLink(payload);
    },
    async verifyOtp(payload: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
      return createClients().auth.verifyOtp(payload);
    },
    async confirmAppointment(
      appointmentId: string,
    ): Promise<ConfirmAppointmentResponseDto> {
      return createClients().booking.confirmAppointment({
        id: appointmentId,
      });
    },
    async exportPersonalData(
      accessToken: string,
      limit?: number,
    ): Promise<ExportPersonalDataResponse> {
      const params = new URLSearchParams();
      if (limit !== undefined) {
        params.set("limit", String(limit));
      }

      const queryString = params.toString();
      const path = queryString
        ? `/api/public/me/personal-data-export?${queryString}`
        : "/api/public/me/personal-data-export";

      return await $fetch<ExportPersonalDataResponse>(path, {
        baseURL: runtimeConfig.public.apiBaseUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    async anonymizePersonalData(
      accessToken: string,
    ): Promise<AnonymizePersonalDataResponse> {
      return await $fetch<AnonymizePersonalDataResponse>(
        "/api/public/me/personal-data",
        {
          baseURL: runtimeConfig.public.apiBaseUrl,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
  };
}
