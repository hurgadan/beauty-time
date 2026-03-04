# beauty-time-booking-web

Nuxt 4 booking frontend for Beauty-Time.

## Flow routes
- `/book/:slug`
- `/book/:slug/service`
- `/book/:slug/specialist`
- `/book/:slug/datetime`
- `/book/:slug/contact`
- `/book/:slug/verify`
- `/book/:slug/success`
- `/book/confirm/:token`

## Current booking implementation status
1. Public contracts integration:
- composable `useBookingApi` uses `@hurgadan/beauty-time-public-contracts` clients/types;
- uses API endpoints for booking config, availability query, create appointment, OTP send/verify, reminder confirmation.
2. Booking flow state:
- centralized multi-step state in `useBookingFlowState` (`service/staff/slot/contact/otp/appointmentId`);
- service/staff catalog is loaded from backend `GET /api/book/:tenantSlug/config`.
3. Implemented edge states:
- no slots available (`/datetime?state=no-slots`);
- OTP expired (`/verify?state=otp-expired`);
- OTP resend action on verify step.
4. Runtime API config:
- `NUXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4000`).

## Contracts wiring
1. `@hurgadan/beauty-time-public-contracts` is installed as npm dependency from GitHub Packages.
2. Local/CI install requires npm auth for GitHub Packages (`NODE_AUTH_TOKEN`).
3. Scope registry is configured in `.npmrc` (`@hurgadan -> npm.pkg.github.com`).

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
GitHub Actions workflow: `.github/workflows/web-ci.yml`
- `npm install`
- `npm run lint`
- `npm run build`

Notes:
1. Workflow runs from monorepo root but uses `working-directory: web`.
2. Lint is mandatory in CI (no `--if-present` fallback).
