# beauty-time-crm-web

Nuxt 4 CRM frontend for Beauty-Time.

## Routes implemented
- `/login`
- `/dashboard`
- `/calendar`
- `/appointments`
- `/services`
- `/staff`
- `/clients/:id`
- `/notifications`
- `/settings`

## Current CRM implementation status
1. Integrated API layer:
- composable `useCrmApi` uses `@hurgadan/beauty-time-crm-contracts` client and types;
- auth login writes JWT into `crm_access_token` cookie;
- page data is loaded only from backend API via contracts client.
2. Connected screens:
- `dashboard`, `calendar`, `appointments`, `services`, `staff`, `clients/:id` read from CRM API client.
3. CRM module actions:
- `services`: list/create/update/delete;
- `appointments`: list/create/update status/cancel;
- `staff`: list/create/update/delete + working-hours replace + time-off create/delete;
- `clients/:id`: profile + visit history + GDPR export/anonymize actions.
4. Mobile parity:
- mobile navigation contains all CRM sections (not reduced subset), so feature access matches desktop.
5. Contracts coverage:
- `useCrmApi` exposes `exportClientData` and `anonymizeClientData` using `CrmApiClient` from contracts package (no manual fetch).

## Contracts wiring
1. `@hurgadan/beauty-time-crm-contracts` is installed as npm dependency from GitHub Packages.
2. API base URL is configurable via runtime env:
- `NUXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4000`)
3. Local/CI install requires npm auth for GitHub Packages (`NODE_AUTH_TOKEN`).
4. Scope registry is configured in `.npmrc` (`@hurgadan -> npm.pkg.github.com`).

## Local run
1. Install dependencies:
- `npm install`
2. Start dev server:
- `npm run dev`
3. Production build:
- `npm run build`

## Quality commands
1. Lint:
- `npm run lint`
2. Build:
- `npm run build`

## CI
GitHub Actions workflow: `.github/workflows/crm-ci.yml`
- `npm install`
- `npm run lint`
- `npm run build`

Notes:
1. Workflow runs from monorepo root but uses `working-directory: crm`.
2. Lint is mandatory in CI (no `--if-present` fallback).
