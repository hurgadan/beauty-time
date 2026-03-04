# Beauty-Time Bootstrap Next Steps

This workspace now contains three separate repository folders:

- `/Users/viig/www/beauty-time/api`
- `/Users/viig/www/beauty-time/crm`
- `/Users/viig/www/beauty-time/web`

## 1) Install dependencies

```bash
cd api && npm install
cd ../crm && npm install
cd ../web && npm install
```

## 2) Run services

```bash
cd api && npm run start:dev
cd ../crm && npm run dev
cd ../web && npm run dev
```

## 3) Immediate implementation priorities

1. Wire CRM and Booking pages to package-specific client methods:
- CRM -> `@hurgadan/beauty-time-crm-contracts`;
- Booking -> `@hurgadan/beauty-time-public-contracts`.
2. Replace mock data in `crm` and `web` with real API calls.
3. Finish Booking API stage (`/book/:tenantSlug/config`, availability query, create/confirm appointment).
4. Complete client auth flow (`send-magic-link`, `verify-otp`) and connect to booking frontend.
5. Implement notification queue + email reminders (`T-24h`, `T-2h`) and confirmation flow.

## 4) Backend implementation agreements (current)

1. Contracts:
- source of truth: `api/src/contracts`;
- one type per file (`*.type.ts`), grouped by module;
- API clients split by package:
  - `src/contracts/public/clients`;
  - `src/contracts/crm/clients`;
- package entrypoint'ы разделены:
  - `src/contracts/public` -> `@hurgadan/beauty-time-public-contracts`;
  - `src/contracts/crm` -> `@hurgadan/beauty-time-crm-contracts`.
2. DTO:
- DTO classes live in module `dto` folders;
- request DTOs use `class-validator`;
- required request fields use `!`;
- DTO classes implement corresponding interfaces from `@contracts`.
3. Architecture:
- strict layering `controller -> service -> repository`;
- repository contains only DB access via TypeORM `Repository`;
- service contains business rules and tenant ownership checks;
- controller performs DTO mapping via `transformToDto`.
4. Public vs CRM controllers:
- public endpoints are isolated in `src/modules/public` with their own DTO;
- CRM endpoints are isolated from public endpoints and remain internal/backoffice API.
5. Response mapping:
- DTOs mapped through `transformToDto` must use `@Expose()` on mapped fields;
- transform is strict (`excludeExtraneousValues: true`).
6. List API standard:
- CRM list routes use explicit `GET .../list`;
- list responses return arrays (`T[]`) without `{ items: [...] }`.
