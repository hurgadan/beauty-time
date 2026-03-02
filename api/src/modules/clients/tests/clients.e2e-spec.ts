import * as request from "supertest";

import { createAuthToken } from "../../../../test/e2e/support/auth-token";
import {
  getE2eApp,
  getE2eDataSource,
} from "../../../../test/e2e/support/e2e-app-context";
import { registerE2eHooks } from "../../../../test/e2e/support/register-e2e-hooks";
import { createAppointment } from "../../../../test/e2e/utils/factories/appointment.factory";
import { createClient } from "../../../../test/e2e/utils/factories/client.factory";
import { createService } from "../../../../test/e2e/utils/factories/service.factory";
import { createStaff } from "../../../../test/e2e/utils/factories/staff.factory";
import { createTenant } from "../../../../test/e2e/utils/factories/tenant.factory";

registerE2eHooks();

describe("Clients (e2e)", () => {
  it("GET /api/crm/clients supports search and tenant isolation", async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenantA = await createTenant(dataSource, { slug: "e2e-clients-a" });
    const tenantB = await createTenant(dataSource, { slug: "e2e-clients-b" });

    await createClient(dataSource, {
      tenantId: tenantA.id,
      firstName: "Sofia",
      lastName: "Ludwig",
      email: "sofia@tenant-a.de",
    });

    await createClient(dataSource, {
      tenantId: tenantB.id,
      firstName: "Sofia",
      lastName: "OtherTenant",
      email: "sofia@tenant-b.de",
    });

    const tokenA = createAuthToken(tenantA.id);

    const response = await request(app.getHttpServer())
      .get("/api/crm/clients?search=sofia")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].email).toBe("sofia@tenant-a.de");
    expect(response.body.items[0].tenantId).toBe(tenantA.id);
  });

  it("GET /api/crm/clients/:id/history returns client appointments", async () => {
    const app = getE2eApp();
    const dataSource = getE2eDataSource();

    const tenant = await createTenant(dataSource, {
      slug: "e2e-client-history",
    });
    const staff = await createStaff(dataSource, { tenantId: tenant.id });
    const service = await createService(dataSource, { tenantId: tenant.id });
    const client = await createClient(dataSource, {
      tenantId: tenant.id,
      email: "history@example.com",
    });

    await createAppointment(dataSource, {
      tenantId: tenant.id,
      staffId: staff.id,
      serviceId: service.id,
      clientId: client.id,
      startsAtIso: "2026-03-12T09:00:00+01:00",
      endsAtIso: "2026-03-12T10:00:00+01:00",
    });

    const token = createAuthToken(tenant.id);

    const response = await request(app.getHttpServer())
      .get(`/api/crm/clients/${client.id}/history`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].staffId).toBe(staff.id);
    expect(response.body.items[0].serviceId).toBe(service.id);
  });
});
