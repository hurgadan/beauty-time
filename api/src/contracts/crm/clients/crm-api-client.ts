import { ApiHttpClient } from './api-http-client';
import type { StaffLoginResponseDto } from '../../types';
import type { StaffLoginDto } from '../../types';
import type { AppointmentDto } from '../../types';
import type { CreateAppointmentDto } from '../../types';
import type { AppointmentStatus } from '../../types';
import type { ListAppointmentsDto } from '../../types';
import type { UpdateAppointmentDto } from '../../types';
import type { ClientHistoryItemDto } from '../../types';
import type { ClientListItemDto } from '../../types';
import type { Client } from '../../types';
import type { ListClientsDto } from '../../types';
import type { CreateServiceDto } from '../../types';
import type { Service } from '../../types';
import type { UpdateServiceDto } from '../../types';
import type { CreateStaffDto } from '../../types';
import type { CreateTimeOffDto } from '../../types';
import type { ListStaffDto } from '../../types';
import type { StaffItemDto } from '../../types';
import type { TimeOffItemDto } from '../../types';
import type { UpdateStaffDto } from '../../types';
import type { UpsertWorkingHoursDto } from '../../types';
import type { WorkingHoursItemDto } from '../../types';

export class CrmApiClient {
  public constructor(private readonly http: ApiHttpClient) {}

  public async staffLogin(payload: StaffLoginDto): Promise<StaffLoginResponseDto> {
    return this.http.request<StaffLoginResponseDto>('/api/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async listAppointments(payload: ListAppointmentsDto = {}): Promise<AppointmentDto[]> {
    const query = new URLSearchParams();
    if (payload.staffId) {
      query.set('staffId', payload.staffId);
    }
    if (payload.status) {
      query.set('status', payload.status as AppointmentStatus);
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

    return this.http.request<AppointmentDto[]>(url, {
      method: 'GET',
    });
  }

  public async createAppointment(payload: CreateAppointmentDto): Promise<AppointmentDto> {
    return this.http.request<AppointmentDto>('/api/crm/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAppointment(
    appointmentId: string,
    payload: UpdateAppointmentDto,
  ): Promise<AppointmentDto> {
    return this.http.request<AppointmentDto>(`/api/crm/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async listServices(): Promise<Service[]> {
    return this.http.request<Service[]>('/api/crm/services/list', {
      method: 'GET',
    });
  }

  public async createService(payload: CreateServiceDto): Promise<Service> {
    return this.http.request<Service>('/api/crm/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateService(serviceId: string, payload: UpdateServiceDto): Promise<Service> {
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

  public async listStaff(payload: ListStaffDto = {}): Promise<StaffItemDto[]> {
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

  public async createStaff(payload: CreateStaffDto): Promise<StaffItemDto> {
    return this.http.request<StaffItemDto>('/api/crm/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateStaff(staffId: string, payload: UpdateStaffDto): Promise<StaffItemDto> {
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
    payload: UpsertWorkingHoursDto,
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

  public async createTimeOff(staffId: string, payload: CreateTimeOffDto): Promise<TimeOffItemDto> {
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

  public async listClients(payload: ListClientsDto = {}): Promise<ClientListItemDto[]> {
    const query = new URLSearchParams();
    if (payload.search) {
      query.set('search', payload.search);
    }
    if (payload.limit !== undefined) {
      query.set('limit', String(payload.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `/api/crm/clients/list?${queryString}` : '/api/crm/clients/list';

    return this.http.request<ClientListItemDto[]>(url, { method: 'GET' });
  }

  public async getClient(id: string): Promise<Client> {
    return this.http.request<Client>(`/api/crm/clients/${id}`, {
      method: 'GET',
    });
  }

  public async getClientHistory(id: string, limit?: number): Promise<ClientHistoryItemDto[]> {
    const query = new URLSearchParams();
    if (limit !== undefined) {
      query.set('limit', String(limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `/api/crm/clients/${id}/history?${queryString}`
      : `/api/crm/clients/${id}/history`;

    return this.http.request<ClientHistoryItemDto[]>(url, {
      method: 'GET',
    });
  }
}
