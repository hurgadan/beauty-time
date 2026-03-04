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
