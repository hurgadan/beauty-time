import {
  ApiHttpClient,
  AuthApiClient,
  BookingApiClient,
  ClientsApiClient,
} from "@hurgadan/beauty-time-public-contracts";
import type {
  AnonymizeClientResponseDto,
  AvailabilityQueryDto,
  AvailabilitySlotDto,
  BookingConfigResponseDto,
  ConfirmAppointmentResponseDto,
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
  ExportClientDataResponseDto,
  SendMagicLinkDto,
  SendMagicLinkResponseDto,
  VerifyOtpDto,
  VerifyOtpResponseDto,
} from "@hurgadan/beauty-time-public-contracts";

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
  ) => Promise<ExportClientDataResponseDto>;
  anonymizePersonalData: (
    accessToken: string,
  ) => Promise<AnonymizeClientResponseDto>;
} {
  const runtimeConfig = useRuntimeConfig();

  function createClients(): {
    auth: AuthApiClient;
    booking: BookingApiClient;
    clients: ClientsApiClient;
  } {
    const http = new ApiHttpClient({
      baseUrl: runtimeConfig.public.apiBaseUrl,
    });

    return {
      auth: new AuthApiClient(http),
      booking: new BookingApiClient(http),
      clients: new ClientsApiClient(http),
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
    ): Promise<ExportClientDataResponseDto> {
      const http = new ApiHttpClient({
        baseUrl: runtimeConfig.public.apiBaseUrl,
        accessToken,
      });

      return new ClientsApiClient(http).exportPersonalData({
        ...(limit !== undefined ? { limit } : {}),
      });
    },
    async anonymizePersonalData(
      accessToken: string,
    ): Promise<AnonymizeClientResponseDto> {
      const http = new ApiHttpClient({
        baseUrl: runtimeConfig.public.apiBaseUrl,
        accessToken,
      });

      return new ClientsApiClient(http).anonymizePersonalData();
    },
  };
}
