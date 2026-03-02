import type {
  AppointmentListItemDto,
  CreateAppointmentRequestDto,
  CreateServiceRequestDto,
  CreateStaffRequestDto,
  CreateTimeOffRequestDto,
  ListAppointmentsRequestDto,
  ListServicesRequestDto,
  ListStaffRequestDto,
  Service,
  StaffItemDto,
  TimeOffItemDto,
  UpdateAppointmentRequestDto,
  UpdateServiceRequestDto,
  UpdateStaffRequestDto,
  UpsertWorkingHoursRequestDto,
  WorkingHoursItemDto,
} from '../types';
import { ApiHttpClient } from './api-http-client';

export class CrmApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async listAppointments(
    payload: ListAppointmentsRequestDto = {},
  ): Promise<AppointmentListItemDto[]> {
    const query = new URLSearchParams();
    if (payload.staffId) {
      query.set('staffId', payload.staffId);
    }
    if (payload.status) {
      query.set('status', payload.status);
    }
    if (payload.fromIso) {
      query.set('fromIso', payload.fromIso);
    }
    if (payload.toIso) {
      query.set('toIso', payload.toIso);
    }
    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/crm/appointments/list?${queryString}`
      : '/api/crm/appointments/list';

    return this.http.request<AppointmentListItemDto[]>(url, {
      method: 'GET',
    });
  }

  public async createAppointment(
    payload: CreateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    return this.http.request<AppointmentListItemDto>('/api/crm/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAppointment(
    appointmentId: string,
    payload: UpdateAppointmentRequestDto,
  ): Promise<AppointmentListItemDto> {
    return this.http.request<AppointmentListItemDto>(`/api/crm/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async listServices(payload: ListServicesRequestDto): Promise<Service[]> {
    void payload;
    return this.http.request<Service[]>('/api/crm/services/list', {
      method: 'GET',
    });
  }

  public async createService(payload: CreateServiceRequestDto): Promise<Service> {
    return this.http.request<Service>('/api/crm/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateService(
    serviceId: string,
    payload: UpdateServiceRequestDto,
  ): Promise<Service> {
    return this.http.request<Service>(`/api/crm/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async deleteService(serviceId: string): Promise<void> {
    await this.http.request<void>(`/api/crm/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  public async listStaff(payload: ListStaffRequestDto = {}): Promise<StaffItemDto[]> {
    const query = new URLSearchParams();
    if (payload.search) {
      query.set('search', payload.search);
    }
    if (payload.role) {
      query.set('role', payload.role);
    }
    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `/api/crm/staff/list?${queryString}` : '/api/crm/staff/list';

    return this.http.request<StaffItemDto[]>(url, { method: 'GET' });
  }

  public async createStaff(payload: CreateStaffRequestDto): Promise<StaffItemDto> {
    return this.http.request<StaffItemDto>('/api/crm/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateStaff(staffId: string, payload: UpdateStaffRequestDto): Promise<StaffItemDto> {
    return this.http.request<StaffItemDto>(`/api/crm/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async deleteStaff(staffId: string): Promise<void> {
    await this.http.request<void>(`/api/crm/staff/${staffId}`, {
      method: 'DELETE',
    });
  }

  public async listWorkingHours(staffId: string): Promise<WorkingHoursItemDto[]> {
    return this.http.request<WorkingHoursItemDto[]>(`/api/crm/staff/${staffId}/working-hours`, {
      method: 'GET',
    });
  }

  public async replaceWorkingHours(
    staffId: string,
    payload: UpsertWorkingHoursRequestDto,
  ): Promise<WorkingHoursItemDto[]> {
    return this.http.request<WorkingHoursItemDto[]>(`/api/crm/staff/${staffId}/working-hours`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async listTimeOff(staffId: string): Promise<TimeOffItemDto[]> {
    return this.http.request<TimeOffItemDto[]>(`/api/crm/staff/${staffId}/time-off`, {
      method: 'GET',
    });
  }

  public async createTimeOff(
    staffId: string,
    payload: CreateTimeOffRequestDto,
  ): Promise<TimeOffItemDto> {
    return this.http.request<TimeOffItemDto>(`/api/crm/staff/${staffId}/time-off`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteTimeOff(staffId: string, timeOffId: string): Promise<void> {
    await this.http.request<void>(`/api/crm/staff/${staffId}/time-off/${timeOffId}`, {
      method: 'DELETE',
    });
  }
}
