# Beauty-Time v1 Design Pack

This directory is the design handoff for frontend implementation.
It contains enough information to start coding both Nuxt 4 frontends now.

## 1) Scope and Source of Truth

Scope is strictly v1:
- CRM (desktop/tablet + full mobile workflow)
- Booking web flow by link (including OTP and edge cases)
- Reminder/confirmation UX for email channel
- Product scope reference: `/Users/viig/www/beauty-time/PLAN.md`

Design source of truth:
- `tokens.json`
- `styles.css`
- all `crm-*.html` and `booking-*.html` screens in this folder

## 2) Core Design Artifacts

- `tokens.json` - color, typography, spacing, radius, shadow, motion tokens
- `styles.css` - visual primitives and component styles
- `crm-prototype.html` - CRM desktop/tablet index
- `crm-mobile-prototype.html` - CRM mobile index
- `booking-prototype.html` - Booking flow index

## 3) Screen Inventory

### CRM desktop/tablet

- `crm-login-onboarding.html`
- `crm-dashboard.html`
- `crm-calendar.html`
- `crm-appointments.html`
- `crm-services.html`
- `crm-staff-schedule.html`
- `crm-client-card.html`
- `crm-notifications.html`
- `crm-settings.html`

### CRM mobile (full workflow)

- `crm-mobile-login-onboarding.html`
- `crm-mobile-dashboard.html`
- `crm-mobile-calendar.html`
- `crm-mobile-appointments.html`
- `crm-mobile-clients.html`
- `crm-mobile-staff-schedule.html`
- `crm-mobile-services.html`
- `crm-mobile-notifications.html`
- `crm-mobile-settings.html`

### Booking flow

- `booking-step-01-landing.html`
- `booking-step-02-service.html`
- `booking-step-03-specialist.html`
- `booking-step-04-datetime.html`
- `booking-step-05-contact.html`
- `booking-step-06-otp.html`
- `booking-step-07-success.html`
- `booking-step-08-reminder-confirm.html`
- `booking-step-09-no-slots.html`
- `booking-step-10-otp-expired.html`
- `booking-privacy-data-request.html`

## 4) Route Map for Nuxt 4 Implementation

Recommended route map to implement from these mockups.

### CRM app (`crm`)

- `/login` -> `crm-login-onboarding.html`
- `/dashboard` -> `crm-dashboard.html`
- `/calendar` -> `crm-calendar.html`
- `/appointments` -> `crm-appointments.html`
- `/services` -> `crm-services.html`
- `/staff` -> `crm-staff-schedule.html`
- `/clients/:id` -> `crm-client-card.html`
- `/notifications` -> `crm-notifications.html`
- `/settings` -> `crm-settings.html`

Mobile requirement:
- Same business modules must work on phone.
- Use responsive layouts and mobile-first variants; do not drop modules on mobile.
- Dedicated mobile mockups are the UX reference for small screens.

Functional parity checklist (desktop vs mobile):
- Login/Onboarding: `crm-login-onboarding.html` <-> `crm-mobile-login-onboarding.html`
- Dashboard: `crm-dashboard.html` <-> `crm-mobile-dashboard.html`
- Calendar: `crm-calendar.html` <-> `crm-mobile-calendar.html`
- Appointments: `crm-appointments.html` <-> `crm-mobile-appointments.html`
- Clients: `crm-client-card.html` <-> `crm-mobile-clients.html`
- Staff & Schedule: `crm-staff-schedule.html` <-> `crm-mobile-staff-schedule.html`
- Services: `crm-services.html` <-> `crm-mobile-services.html`
- Notifications: `crm-notifications.html` <-> `crm-mobile-notifications.html`
- Settings: `crm-settings.html` <-> `crm-mobile-settings.html`

### Booking app (`web`)

- `/book/:slug` -> step 1 landing
- `/book/:slug/service` -> step 2
- `/book/:slug/specialist` -> step 3
- `/book/:slug/datetime` -> step 4
- `/book/:slug/contact` -> step 5
- `/book/:slug/verify` -> step 6 OTP
- `/book/:slug/success` -> step 7
- `/book/confirm/:token` -> step 8 reminder confirmation
- `/privacy/data-request` -> privacy/GDPR self-service page

Edge states as route-level states or in-page states:
- no slots
- OTP expired

Privacy/GDPR entry rule:
- footer link `Privacy / GDPR request` must be present on all public booking pages and point to `/privacy/data-request`;
- do not add extra GDPR entry points in booking steps; footer is the single global entry.

## 5) Component Checklist (must be reusable)

Layout:
- CRM desktop shell (sidebar + content)
- CRM mobile shell (topbar + bottom nav)
- Booking split layout (content + phone preview)

Inputs and actions:
- Button (primary/secondary/ghost)
- Input, Select, Checkbox
- Form error and validation blocks

Data and scheduling:
- Badge/status pill
- Slot button/grid
- Appointment card
- Table/list blocks

Feedback and state:
- Empty state
- Error state
- Success state
- Loading skeleton state

## 6) API Contract Integration (frontend)

Use npm packages from backend CI:
- `@hurgadan/beauty-time-crm-contracts` (для CRM фронта)
- `@hurgadan/beauty-time-public-contracts` (для booking фронта)

Required endpoint groups for first frontend milestone:

Auth:
- `POST /auth/staff/login`
- `POST /auth/client/send-magic-link`
- `POST /auth/client/verify-otp`

CRM:
- `GET/POST /crm/services`
- `GET/POST /crm/staff`
- `GET/POST /crm/appointments`
- `PATCH /crm/appointments/:id`
- `GET /clients/:id`

Booking:
- `GET /book/:tenantSlug/config`
- `POST /book/:tenantSlug/availability/query`
- `POST /book/:tenantSlug/appointments`
- `POST /book/appointments/:id/confirm`
- `GET /public/me/personal-data-export` (client JWT)
- `DELETE /public/me/personal-data` (client JWT)

## 7) UX Rules to Keep During Coding

- CRM mobile is first-class, not a reduced feature subset.
- Booking should be completable in under 2 minutes.

Show clear status labels:
- `booked`
- `confirmed_by_reminder`
- `completed`
- `cancelled_by_client`
- `cancelled_by_staff`
- `no_show`

Handle edge states explicitly:
- slot already taken during confirmation
- no slots available
- OTP expired + resend

Keep accessibility:
- visible focus states
- keyboard navigation on desktop
- AA-level contrast

## 8) Breakpoints

- Mobile: 360-767
- Tablet: 768-1023
- Desktop: 1024+

## 9) Done Criteria for Frontend Start

Frontend implementation can start immediately when:
- Nuxt 4 repo scaffold is ready for CRM and Booking repos.
- Design tokens are copied into shared theme files.
- Route skeleton from section 4 exists.
- Reusable components from section 5 exist in base form.
- API client package is wired with typed request/response models.

## 10) Quick Review Path

1. Open `crm-prototype.html`.
2. Open `crm-mobile-prototype.html`.
3. Open `booking-prototype.html`.
4. Validate against `/Users/viig/www/beauty-time/PLAN.md`.
