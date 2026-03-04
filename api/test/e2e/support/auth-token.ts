import { JwtService } from "@nestjs/jwt";

import { E2E_DEFAULT_JWT_SECRET } from "./e2e-env";

export function createAuthToken(
  tenantId: string,
  role: "owner" | "staff" | "client" = "owner",
  sub = "e2e-user",
): string {
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET ?? E2E_DEFAULT_JWT_SECRET,
  });

  return jwtService.sign({ sub, tenantId, role });
}
