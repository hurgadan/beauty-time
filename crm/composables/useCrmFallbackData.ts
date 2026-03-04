import { AppointmentStatus } from "@hurgadan/beauty-time-crm-contracts";
import type {
  AppointmentDto,
  Client,
  ClientHistoryItemDto,
  ClientListItemDto,
  Service,
  StaffItemDto,
} from "@hurgadan/beauty-time-crm-contracts";

const tenantId = "a1234567-89ab-7def-8123-456789abcdef";

const fallbackAppointments: AppointmentDto[] = [
  {
    id: "a1234567-89ab-7def-8123-456789abc001",
    tenantId,
    staffId: "a1234567-89ab-7def-8123-456789abc011",
    serviceId: "a1234567-89ab-7def-8123-456789abc101",
    clientId: "a1234567-89ab-7def-8123-456789abc201",
    startsAtIso: "2026-03-04T09:00:00+01:00",
    endsAtIso: "2026-03-04T09:45:00+01:00",
    status: AppointmentStatus.CONFIRMED_BY_REMINDER,
    notes: null,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc002",
    tenantId,
    staffId: "a1234567-89ab-7def-8123-456789abc012",
    serviceId: "a1234567-89ab-7def-8123-456789abc102",
    clientId: "a1234567-89ab-7def-8123-456789abc202",
    startsAtIso: "2026-03-04T10:00:00+01:00",
    endsAtIso: "2026-03-04T11:00:00+01:00",
    status: AppointmentStatus.BOOKED,
    notes: "First visit.",
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc003",
    tenantId,
    staffId: "a1234567-89ab-7def-8123-456789abc011",
    serviceId: "a1234567-89ab-7def-8123-456789abc103",
    clientId: "a1234567-89ab-7def-8123-456789abc203",
    startsAtIso: "2026-03-04T11:00:00+01:00",
    endsAtIso: "2026-03-04T11:40:00+01:00",
    status: AppointmentStatus.BOOKED,
    notes: null,
  },
];

const fallbackServices: Service[] = [
  {
    id: "a1234567-89ab-7def-8123-456789abc101",
    tenantId,
    name: "Haircut + Styling",
    description: "Classic cut with styling finish.",
    priceCents: 4900,
    durationMinutes: 45,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 10,
    isActive: true,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc102",
    tenantId,
    name: "Manicure Premium",
    description: "Nail care with premium polish.",
    priceCents: 5500,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 10,
    isActive: true,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc103",
    tenantId,
    name: "Pedicure Classic",
    description: "Classic pedicure with care finish.",
    priceCents: 4500,
    durationMinutes: 40,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 10,
    isActive: true,
  },
];

const fallbackStaff: StaffItemDto[] = [
  {
    id: "a1234567-89ab-7def-8123-456789abc011",
    tenantId,
    email: "mila@studio.de",
    fullName: "Mila Krause",
    role: "owner",
    isActive: true,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc012",
    tenantId,
    email: "anna@studio.de",
    fullName: "Anna Vogel",
    role: "staff",
    isActive: true,
  },
];

const fallbackClients: ClientListItemDto[] = [
  {
    id: "a1234567-89ab-7def-8123-456789abc201",
    tenantId,
    firstName: "Lea",
    lastName: "Mertens",
    salutation: "frau",
    gender: "female",
    email: "lea@example.de",
    phone: "+491751234501",
    isReturningClient: true,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc202",
    tenantId,
    firstName: "Jana",
    lastName: "Roth",
    salutation: "frau",
    gender: "female",
    email: "jana@example.de",
    phone: null,
    isReturningClient: false,
  },
  {
    id: "a1234567-89ab-7def-8123-456789abc203",
    tenantId,
    firstName: "Sofia",
    lastName: "Ludwig",
    salutation: "frau",
    gender: "female",
    email: "sofia@example.de",
    phone: "+491751234503",
    isReturningClient: true,
  },
];

const fallbackClientHistory: ClientHistoryItemDto[] = [
  {
    appointmentId: "a1234567-89ab-7def-8123-456789abc301",
    staffId: "a1234567-89ab-7def-8123-456789abc011",
    serviceId: "a1234567-89ab-7def-8123-456789abc103",
    startsAtIso: "2026-02-20T15:00:00+01:00",
    endsAtIso: "2026-02-20T15:40:00+01:00",
    status: AppointmentStatus.COMPLETED,
    notes: null,
  },
  {
    appointmentId: "a1234567-89ab-7def-8123-456789abc302",
    staffId: "a1234567-89ab-7def-8123-456789abc012",
    serviceId: "a1234567-89ab-7def-8123-456789abc102",
    startsAtIso: "2026-01-18T10:00:00+01:00",
    endsAtIso: "2026-01-18T11:00:00+01:00",
    status: AppointmentStatus.COMPLETED,
    notes: "Requested neutral colors.",
  },
];

export function useCrmFallbackData(): {
  appointments: AppointmentDto[];
  services: Service[];
  staff: StaffItemDto[];
  clients: ClientListItemDto[];
  getClientById: (id: string) => Client;
  clientHistory: ClientHistoryItemDto[];
} {
  return {
    appointments: fallbackAppointments,
    services: fallbackServices,
    staff: fallbackStaff,
    clients: fallbackClients,
    getClientById(id: string): Client {
      const foundClient = fallbackClients.find((client) => client.id === id);

      if (foundClient) {
        return foundClient;
      }

      const firstClient = fallbackClients[0];
      return {
        ...firstClient,
        id,
      };
    },
    clientHistory: fallbackClientHistory,
  };
}
