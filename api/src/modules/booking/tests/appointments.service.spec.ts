import { AppointmentStatus, type CreateAppointmentDto, type ListAppointmentsDto } from '@contracts';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { ClientsService } from '../../clients/clients.service';
import { ServicesService } from '../../services/services.service';
import { StaffService } from '../../staff/staff.service';
import { BookingAppointmentsRepository } from '../booking-appointments.repository';
import { BookingAppointmentsService } from '../booking-appointments.service';

type BookingAppointmentsRepositoryMock = Partial<
  Record<keyof BookingAppointmentsRepository, jest.Mock>
>;
type StaffServiceMock = Partial<Record<keyof StaffService, jest.Mock>>;
type ServicesServiceMock = Partial<Record<keyof ServicesService, jest.Mock>>;
type ClientsServiceMock = Partial<Record<keyof ClientsService, jest.Mock>>;

function createBookingAppointmentsRepositoryMock(): BookingAppointmentsRepositoryMock {
  return {
    findAppointments: jest.fn(),
    hasAppointmentOverlap: jest.fn(),
    createAppointment: jest.fn(),
    saveAppointment: jest.fn(),
  };
}

function createStaffServiceMock(): StaffServiceMock {
  return {
    findActiveStaffById: jest.fn(),
  };
}

function createServicesServiceMock(): ServicesServiceMock {
  return {
    findActiveServiceById: jest.fn(),
  };
}

function createClientsServiceMock(): ClientsServiceMock {
  return {
    getClientOptional: jest.fn(),
  };
}

describe('BookingAppointmentsService', () => {
  let service: BookingAppointmentsService;
  let bookingAppointmentsRepository: BookingAppointmentsRepositoryMock;
  let staffService: StaffServiceMock;
  let servicesService: ServicesServiceMock;
  let clientsService: ClientsServiceMock;

  beforeEach(() => {
    bookingAppointmentsRepository = createBookingAppointmentsRepositoryMock();
    staffService = createStaffServiceMock();
    servicesService = createServicesServiceMock();
    clientsService = createClientsServiceMock();
    service = new BookingAppointmentsService(
      bookingAppointmentsRepository as unknown as BookingAppointmentsRepository,
      staffService as unknown as StaffService,
      servicesService as unknown as ServicesService,
      clientsService as unknown as ClientsService,
    );
  });

  it('listAppointments passes query filters and limit to repository', async () => {
    bookingAppointmentsRepository.findAppointments!.mockResolvedValue([]);
    const query: ListAppointmentsDto = {
      staffId: 'staff-id',
      status: AppointmentStatus.BOOKED,
      fromIso: '2026-03-01T00:00:00Z',
      toIso: '2026-03-31T23:59:59Z',
      limit: 10,
    };

    await service.listAppointments('tenant-id', query);

    expect(bookingAppointmentsRepository.findAppointments).toHaveBeenCalledWith('tenant-id', query);
  });

  it('createAppointment throws BadRequestException when start >= end', async () => {
    const payload: CreateAppointmentDto = {
      staffId: 'staff-id',
      serviceId: 'service-id',
      clientId: 'client-id',
      startsAtIso: '2026-03-10T10:00:00Z',
      endsAtIso: '2026-03-10T09:00:00Z',
    };

    await expect(service.createAppointment('tenant-id', payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('createAppointment throws ConflictException on overlapping slot', async () => {
    staffService.findActiveStaffById!.mockResolvedValue({
      id: 'staff-id',
    });
    servicesService.findActiveServiceById!.mockResolvedValue({
      id: 'service-id',
    });
    clientsService.getClientOptional!.mockResolvedValue({
      id: 'client-id',
    });
    bookingAppointmentsRepository.hasAppointmentOverlap!.mockResolvedValue(true);

    const payload: CreateAppointmentDto = {
      staffId: 'staff-id',
      serviceId: 'service-id',
      clientId: 'client-id',
      startsAtIso: '2026-03-10T09:00:00Z',
      endsAtIso: '2026-03-10T10:00:00Z',
    };

    await expect(service.createAppointment('tenant-id', payload)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('createAppointment saves and returns mapped appointment', async () => {
    staffService.findActiveStaffById!.mockResolvedValue({
      id: 'staff-id',
    });
    servicesService.findActiveServiceById!.mockResolvedValue({
      id: 'service-id',
    });
    clientsService.getClientOptional!.mockResolvedValue({
      id: 'client-id',
    });
    bookingAppointmentsRepository.hasAppointmentOverlap!.mockResolvedValue(false);
    bookingAppointmentsRepository.createAppointment!.mockReturnValue({
      tenantId: 'tenant-id',
      staffId: 'staff-id',
      serviceId: 'service-id',
      clientId: 'client-id',
      startsAt: new Date('2026-03-10T09:00:00Z'),
      endsAt: new Date('2026-03-10T10:00:00Z'),
      notes: 'new client',
    });
    bookingAppointmentsRepository.saveAppointment!.mockImplementation(async () => ({
      id: 'appointment-id',
      tenantId: 'tenant-id',
      staffId: 'staff-id',
      serviceId: 'service-id',
      clientId: 'client-id',
      startsAt: new Date('2026-03-10T09:00:00Z'),
      endsAt: new Date('2026-03-10T10:00:00Z'),
      notes: 'new client',
      status: AppointmentStatus.BOOKED,
    }));

    const payload: CreateAppointmentDto = {
      staffId: 'staff-id',
      serviceId: 'service-id',
      clientId: 'client-id',
      startsAtIso: '2026-03-10T09:00:00Z',
      endsAtIso: '2026-03-10T10:00:00Z',
      notes: 'new client',
    };

    const result = await service.createAppointment('tenant-id', payload);

    expect(result.id).toBe('appointment-id');
    expect(result.staffId).toBe('staff-id');
    expect(result.serviceId).toBe('service-id');
    expect(result.clientId).toBe('client-id');
    expect(result.status).toBe(AppointmentStatus.BOOKED);
  });
});
