# beauty-time-api

NestJS + TypeORM backend for Beauty-Time.

## MVP modules
- Auth
- Public API (public controllers + public DTO)
- Services
- Staff (including working-hours/time-off)
- Booking (public flow + appointments management API)
- Clients
- Notifications

## Contracts
Contracts are defined in `src/contracts` and are split into two publishable packages:
- `@beauty-time/public-contracts`
- `@beauty-time/crm-contracts`

### Contracts conventions
1. Location:
- `src/contracts/types/<module>` for shared types.
- `src/contracts/public/clients` for public API clients.
- `src/contracts/crm/clients` for CRM API clients.
- `src/contracts/public/index.ts` as public package entrypoint.
- `src/contracts/crm/index.ts` as CRM package entrypoint.
2. Structure:
- one interface/type per file with suffix `*.type.ts`;
- `index.ts` re-exports on each level.
3. API shape:
- `Create*` payloads contain required entity fields;
- `Update*` payloads are partial (no required fields);
- list endpoints return arrays (no `{ items: [...] }` wrapper).
4. Naming:
- request types do not use redundant `Request` suffix when action prefix already exists (`Get*`, `Create*`, `Update*`);
- transport envelopes (`{ payload: ... }`) are not used in contracts or API clients.
5. DTO integration:
- request/response DTO classes in modules implement corresponding contracts from `@contracts`.
6. Package boundaries:
- `@beauty-time/public-contracts` exports only public clients and public-required domain types;
- `@beauty-time/crm-contracts` exports only CRM clients and CRM-required domain types.

## Data access architecture
1. Layering:
- `controller -> service -> repository`.
2. Access policy:
- `service` layer must not access TypeORM repositories directly;
- all DB access is isolated in `*.repository.ts` providers.
3. Type safety:
- repository providers use TypeORM `Repository<Entity>` methods as the default path;
- `QueryBuilder` is allowed only for genuinely complex queries where Repository API is not practical.
4. Module placement:
- repository providers are placed in the same module folder (`src/modules/<module>/*.repository.ts`).
5. Cross-module access:
- a module `repository` must not inject entities from other modules;
- if module A needs data/logic from module B, module A service uses module B service (module import + provider export).
Applied examples:
- `AuthService` uses `TenantService` + `ClientsService`; `OtpSessionRepository` works only with `OtpSessionEntity`.
- `BookingService` uses `TenantService`/`ServicesService`/`StaffService`/`ClientsService`; booking repositories are limited to appointment persistence/availability operations.

### Service and repository conventions
1. Repository layer:
- contains only DB access logic and TypeORM operations;
- no business rules, authorization checks, or response mapping.
2. Service layer:
- contains domain/business logic and permission checks (including tenant ownership checks for update/delete flows);
- returns domain entities (or entity-derived data), not transport DTOs.
3. Controller layer:
- maps service results to response DTOs via `transformToDto`;
- DTO fields used in transform must be marked with `@Expose()`;
- `transformToDto` runs with `excludeExtraneousValues: true`.

### DTO conventions
1. Placement:
- DTO files are placed in module-local `dto` folders near controller files.
2. Validation:
- class-validator is mandatory for request DTOs.
3. Required fields:
- mandatory request DTO fields use non-null assertion (`!`).
4. Swagger:
- controllers and DTO classes are annotated with Swagger decorators.
5. Mapping:
- DTO mapping is controller responsibility; services do not map entities into DTOs.

## Implemented API (current)
1. `GET /api/health`
2. Public booking:
- `GET /api/book/:tenantSlug/config`
- `POST /api/book/:tenantSlug/availability/query`
- `POST /api/book/:tenantSlug/appointments`
- `POST /api/book/appointments/:id/confirm`
Public booking behavior (MVP):
- booking config is resolved by tenant `slug` and returns tenant timezone;
- availability is calculated from working hours + time-off + existing appointments + service duration/buffers;
- slot step is 30 minutes;
- public appointment creation auto-deduplicates client by `tenant+email` and creates client on first visit;
- concurrent bookings for the same staff slot are protected by DB transaction + pessimistic lock on staff row.
3. Public auth:
- `POST /api/auth/client/send-magic-link`
- `POST /api/auth/client/verify-otp`
Public auth request payloads (MVP):
- both endpoints require `tenantSlug` + `email`;
- `verify-otp` also requires 6-digit `otp`.
Public auth behavior (MVP):
- tenant context is resolved by `tenantSlug` (not by headers/url tenantId);
- OTP session is created in `otp_sessions` with TTL 10 minutes;
- resend is rate-limited (max 3 sends per 15 minutes per `tenant+email`);
- verify has attempt limit (max 5 attempts per session);
- OTP session is one-time (consumed on successful verify or after limits/expiry);
- on successful verify API returns client JWT token;
- client is deduplicated by `tenant+email`; if not found, minimal client record is created.
4. CRM auth:
- `POST /api/auth/staff/login`
5. Appointments:
- `GET /api/crm/appointments/list`
- `POST /api/crm/appointments`
- `PATCH /api/crm/appointments/:id`
6. Services:
- `GET /api/crm/services/list`
- `POST /api/crm/services`
- `PATCH /api/crm/services/:id`
- `DELETE /api/crm/services/:id`
7. Staff:
- `GET /api/crm/staff/list`
- `POST /api/crm/staff`
- `PATCH /api/crm/staff/:id`
- `DELETE /api/crm/staff/:id`
- `GET /api/crm/staff/:id/working-hours`
- `PUT /api/crm/staff/:id/working-hours`
- `GET /api/crm/staff/:id/time-off`
- `POST /api/crm/staff/:id/time-off`
- `DELETE /api/crm/staff/:staffId/time-off/:timeOffId`
8. Clients:
- `GET /api/crm/clients/list`
- `GET /api/crm/clients/:id`
- `GET /api/crm/clients/:id/history`

Controller naming conventions:
- CRM controllers use `crm-` file prefix (`crm-services.controller.ts`, `crm-staff.controller.ts`, `crm-clients.controller.ts`, `crm-booking-appointments.controller.ts`);
- public controllers use `public-` file prefix and are colocated in their domain modules (`auth`, `booking`).

Query filters/pagination (MVP):
1. `GET /api/crm/appointments/list`:
- `staffId`, `status`, `fromIso`, `toIso`, `limit`
2. `GET /api/crm/staff/list`:
- `search`, `role`, `limit`
3. `GET /api/crm/clients/list`:
- `search`, `limit`
4. `GET /api/crm/clients/:id/history`:
- `limit`

## Local run
1. Install dependencies:
- `npm install`
2. Start API in dev mode:
- `npm run start:dev`
3. Health check:
- `GET http://localhost:4000/api/health`

## Quality commands
1. Lint:
- `npm run lint`
2. Build:
- `npm run build`
3. Unit tests:
- `npm run test`
4. Contracts package builds:
- `npm run contracts:build:public`
- `npm run contracts:build:crm`
5. E2E tests:
- `npm run test:e2e`

## Migrations
1. Show pending/applied migrations:
- `npm run typeorm:migration:show`
2. Apply migrations:
- `npm run typeorm:migration:run`
3. Revert last migration:
- `npm run typeorm:migration:revert`

## E2E tests
1. Start e2e infrastructure (Docker Postgres 18 + `tmpfs`):
- `npm run test:e2e:up`
2. Run e2e tests:
- `npm run test:e2e:run`
3. Stop and cleanup e2e infrastructure:
- `npm run test:e2e:down`
4. One-command full run:
- `npm run test:e2e`

E2E conventions:
- Postgres runs in Docker with ephemeral storage (`tmpfs`).
- E2E infrastructure is in `test/e2e`:
  - config: `test/e2e/config`
  - setup hooks: `test/e2e/setup`
  - shared app context: `test/e2e/support`
  - helpers/factories: `test/e2e/utils`
- E2E test specs are module-local:
  - `src/modules/<module>/tests/*.e2e-spec.ts`
  - public booking flow: `src/modules/booking/tests/public-booking.e2e-spec.ts`
  - public auth flow: `src/modules/auth/tests/public-auth.e2e-spec.ts`
- Unit test specs are module-local:
  - `src/modules/<module>/tests/*.spec.ts`
- Hooks are registered in each e2e spec via `registerE2eHooks()`.
- Migrations are applied in e2e global setup before tests.
- DB is fully cleaned in `beforeEach` via `test/e2e/utils/db-cleaner.ts`.

## Database structure conventions
1. Entities are stored by module in:
- `src/modules/<module>/dao/*.entity.ts`
2. Migrations are stored by module in:
- `src/modules/<module>/dao/migrations/*.migration.ts`
3. Migration style:
- use TypeORM migration API (`Table`, `TableIndex`, `TableForeignKey`);
- avoid raw SQL for schema creation.
4. Data source for migrations:
- `database/data-source.js`
- entities are discovered by glob `src/**/**/*.entity{.ts,.js}`
- migrations are discovered by glob `src/**/**/migrations/*{.ts,.js}`
5. Index policy:
- in migrations keep only minimal required indexes;
- additional performance indexes are added only after profiling/query evidence.
6. Visual clarity in entities:
- keep `@Index` decorators in entity classes even if a specific index is not yet created in migration.

## CI
GitHub Actions workflow: `.github/workflows/api-ci.yml`
- `npm install`
- `npm run lint`
- `npm run build`
- `npm run contracts:build:public`
- `npm run contracts:build:crm`
- `npm run test`
- `npm run test:e2e` (when e2e files are present)
