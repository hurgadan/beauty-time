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

Mobile and desktop variants are expected to be functionally equivalent.

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
