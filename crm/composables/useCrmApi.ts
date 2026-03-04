import {
  ApiHttpClient,
  CrmApiClient,
} from "@hurgadan/beauty-time-crm-contracts";
import type {
  AppointmentDto,
  Client,
  ClientHistoryItemDto,
  ClientListItemDto,
  CreateAppointmentDto,
  CreateServiceDto,
  CreateStaffDto,
  CreateTimeOffDto,
  ListAppointmentsDto,
  ListClientsDto,
  ListStaffDto,
  Service,
  StaffItemDto,
  StaffLoginDto,
  StaffLoginResponseDto,
  TimeOffItemDto,
  UpdateAppointmentDto,
  UpdateServiceDto,
  UpdateStaffDto,
  UpsertWorkingHoursDto,
  WorkingHoursItemDto,
} from "@hurgadan/beauty-time-crm-contracts";

export function useCrmApi(): {
  staffLogin: (payload: StaffLoginDto) => Promise<StaffLoginResponseDto>;
  listAppointments: (
    payload?: ListAppointmentsDto,
  ) => Promise<AppointmentDto[]>;
  createAppointment: (payload: CreateAppointmentDto) => Promise<AppointmentDto>;
  updateAppointment: (
    appointmentId: string,
    payload: UpdateAppointmentDto,
  ) => Promise<AppointmentDto>;
  listServices: () => Promise<Service[]>;
  createService: (payload: CreateServiceDto) => Promise<Service>;
  updateService: (
    serviceId: string,
    payload: UpdateServiceDto,
  ) => Promise<Service>;
  deleteService: (serviceId: string) => Promise<void>;
  listStaff: (payload?: ListStaffDto) => Promise<StaffItemDto[]>;
  createStaff: (payload: CreateStaffDto) => Promise<StaffItemDto>;
  updateStaff: (
    staffId: string,
    payload: UpdateStaffDto,
  ) => Promise<StaffItemDto>;
  deleteStaff: (staffId: string) => Promise<void>;
  listWorkingHours: (staffId: string) => Promise<WorkingHoursItemDto[]>;
  replaceWorkingHours: (
    staffId: string,
    payload: UpsertWorkingHoursDto,
  ) => Promise<WorkingHoursItemDto[]>;
  listTimeOff: (staffId: string) => Promise<TimeOffItemDto[]>;
  createTimeOff: (
    staffId: string,
    payload: CreateTimeOffDto,
  ) => Promise<TimeOffItemDto>;
  deleteTimeOff: (staffId: string, timeOffId: string) => Promise<void>;
  listClients: (payload?: ListClientsDto) => Promise<ClientListItemDto[]>;
  getClient: (id: string) => Promise<Client>;
  getClientHistory: (
    id: string,
    limit?: number,
  ) => Promise<ClientHistoryItemDto[]>;
  hasToken: () => boolean;
} {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("crm_access_token", {
    sameSite: "lax",
  });

  function client(): CrmApiClient {
    return new CrmApiClient(
      new ApiHttpClient({
        baseUrl: config.public.apiBaseUrl,
        accessToken: token.value ?? undefined,
      }),
    );
  }

  return {
    async staffLogin(payload: StaffLoginDto): Promise<StaffLoginResponseDto> {
      const response = await client().staffLogin(payload);
      token.value = response.accessToken;
      return response;
    },
    async listAppointments(
      payload: ListAppointmentsDto = {},
    ): Promise<AppointmentDto[]> {
      return client().listAppointments(payload);
    },
    async createAppointment(
      payload: CreateAppointmentDto,
    ): Promise<AppointmentDto> {
      return client().createAppointment(payload);
    },
    async updateAppointment(
      appointmentId: string,
      payload: UpdateAppointmentDto,
    ): Promise<AppointmentDto> {
      return client().updateAppointment(appointmentId, payload);
    },
    async listServices(): Promise<Service[]> {
      return client().listServices();
    },
    async createService(payload: CreateServiceDto): Promise<Service> {
      return client().createService(payload);
    },
    async updateService(
      serviceId: string,
      payload: UpdateServiceDto,
    ): Promise<Service> {
      return client().updateService(serviceId, payload);
    },
    async deleteService(serviceId: string): Promise<void> {
      await client().deleteService(serviceId);
    },
    async listStaff(payload: ListStaffDto = {}): Promise<StaffItemDto[]> {
      return client().listStaff(payload);
    },
    async createStaff(payload: CreateStaffDto): Promise<StaffItemDto> {
      return client().createStaff(payload);
    },
    async updateStaff(
      staffId: string,
      payload: UpdateStaffDto,
    ): Promise<StaffItemDto> {
      return client().updateStaff(staffId, payload);
    },
    async deleteStaff(staffId: string): Promise<void> {
      await client().deleteStaff(staffId);
    },
    async listWorkingHours(staffId: string): Promise<WorkingHoursItemDto[]> {
      return client().listWorkingHours(staffId);
    },
    async replaceWorkingHours(
      staffId: string,
      payload: UpsertWorkingHoursDto,
    ): Promise<WorkingHoursItemDto[]> {
      return client().replaceWorkingHours(staffId, payload);
    },
    async listTimeOff(staffId: string): Promise<TimeOffItemDto[]> {
      return client().listTimeOff(staffId);
    },
    async createTimeOff(
      staffId: string,
      payload: CreateTimeOffDto,
    ): Promise<TimeOffItemDto> {
      return client().createTimeOff(staffId, payload);
    },
    async deleteTimeOff(staffId: string, timeOffId: string): Promise<void> {
      await client().deleteTimeOff(staffId, timeOffId);
    },
    async listClients(
      payload: ListClientsDto = {},
    ): Promise<ClientListItemDto[]> {
      return client().listClients(payload);
    },
    async getClient(id: string): Promise<Client> {
      return client().getClient(id);
    },
    async getClientHistory(
      id: string,
      limit?: number,
    ): Promise<ClientHistoryItemDto[]> {
      return client().getClientHistory(id, limit);
    },
    hasToken(): boolean {
      return Boolean(token.value);
    },
  };
}
