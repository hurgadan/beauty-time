import { AppointmentStatus } from "@contracts";
import { NotFoundException } from "@nestjs/common";

import { ClientsRepository } from "../clients.repository";
import { ClientsService } from "../clients.service";

type ClientsRepositoryMock = Partial<
  Record<keyof ClientsRepository, jest.Mock>
>;

function createClientsRepositoryMock(): ClientsRepositoryMock {
  return {
    findClientById: jest.fn(),
    countClientAppointments: jest.fn(),
    findClients: jest.fn(),
    findAppointmentsByClientIds: jest.fn(),
    findClientHistory: jest.fn(),
  };
}

describe("ClientsService", () => {
  let service: ClientsService;
  let clientsRepository: ClientsRepositoryMock;

  beforeEach(() => {
    clientsRepository = createClientsRepositoryMock();
    service = new ClientsService(
      clientsRepository as unknown as ClientsRepository,
    );
  });

  it("listClients passes search and limit to repository", async () => {
    clientsRepository.findClients!.mockResolvedValue([]);
    clientsRepository.findAppointmentsByClientIds!.mockResolvedValue([]);

    await service.listClients("tenant-id", { search: "sofia", limit: 3 });

    expect(clientsRepository.findClients).toHaveBeenCalledWith("tenant-id", {
      search: "sofia",
      limit: 3,
    });
  });

  it("getClient throws NotFoundException when client does not exist", async () => {
    clientsRepository.findClientById!.mockResolvedValue(null);

    await expect(
      service.getClient("tenant-id", "client-id"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("getClient returns mapped client and returning flag based on visit count", async () => {
    clientsRepository.findClientById!.mockResolvedValue({
      id: "client-id",
      tenantId: "tenant-id",
      firstName: "Sofia",
      lastName: "Ludwig",
      salutation: "frau",
      gender: "female",
      email: "sofia@example.com",
      phone: null,
    });
    clientsRepository.countClientAppointments!.mockResolvedValue(2);

    const result = await service.getClient("tenant-id", "client-id");

    expect(result.id).toBe("client-id");
    expect(result.isReturningClient).toBe(true);
  });

  it("listClientHistory returns mapped items", async () => {
    clientsRepository.findClientById!.mockResolvedValue({ id: "client-id" });
    clientsRepository.findClientHistory!.mockResolvedValue([
      {
        id: "appt-1",
        staffId: "staff-1",
        serviceId: "service-1",
        startsAt: new Date("2026-03-10T09:00:00Z"),
        endsAt: new Date("2026-03-10T10:00:00Z"),
        status: AppointmentStatus.BOOKED,
        notes: null,
      },
    ]);

    const result = await service.listClientHistory(
      "tenant-id",
      "client-id",
      20,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].appointmentId).toBe("appt-1");
    expect(result.items[0].staffId).toBe("staff-1");
  });
});
