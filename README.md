# Kids & Family Fun Day Kenya

Kenya's premier outdoor family festival platform — a full-stack event management and ticketing SaaS application built with Next.js, Prisma, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Design System](#design-system)
- [Role-Based Access](#role-based-access)
- [Deployment](#deployment)

## Overview

Kids & Family Fun Day Kenya is a production-grade multi-role platform that powers Kenya's family festival ecosystem. It supports event creation, multi-type ticketing, M-Pesa payments, vendor marketplaces, sponsor management, real-time QR check-in, web push notifications, and comprehensive admin reporting — all within a single deployable Next.js application.

**Live site:** `https://kidsfamilyfunday.co.ke`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 6 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 with Neon HTTP adapter |
| Auth | NextAuth v5 (Auth.js) with JWT strategy |
| Styling | Tailwind CSS 4 with custom design tokens |
| Validation | Zod 4 |
| Email | Resend (transactional API) |
| Push Notifications | Web Push (VAPID) |
| Payments | M-Pesa Daraja API (STK Push) |
| Charts | Custom SVG (BarChart, DonutChart) |
| QR Codes | `qrcode` library |
| Exports | `exceljs` (Excel) + custom CSV generation |
| Fonts | Plus Jakarta Sans (display), Inter (body), IBM Plex Mono (mono) |

## Features

### Event Management & Ticketing
- Full event lifecycle: Draft → Published → Sold Out / Cancelled / Completed
- Multiple ticket types per event with independent pricing and capacity
- Real-time ticket availability with race-condition-safe booking
- Registration open/close date windows
- Related events discovery

### QR Code Ticket System
- Unique `TKT-{hex}` ticket codes per booking
- QR code rendering on digital tickets
- Admin check-in at `/checkin/[token]` with color-coded results:
  - Green = Valid, checked in
  - Yellow = Already checked in
  - Red = Cancelled / Not found
- Optimistic locking prevents double-check-in

### Vendor Marketplace
- Self-service registration at `/become-a-vendor`
- Admin approval workflow: Pending Review → Awaiting Payment → Active
- 8 service categories: Catering, Photography, Entertainment, Decorations, Equipment Rental, Kids Activities, Transport, Other
- Public marketplace with search, category filter, sort
- Per-service analytics (views, category breakdown, growth)

### Sponsorship Management
- 4 tiers: Bronze, Silver, Gold, Platinum
- Event-sponsor linking (many-to-many)
- Display ordering and publish/unpublish toggle

### Reviews & Ratings
- 1–5 star reviews per event (one per user per event)
- Published/Hidden moderation status
- Average rating calculation
- Review eligibility check (must have attended)

### Notifications
- In-app notifications (5 types)
- Web push notifications via VAPID
- Automatic push on booking events
- Stale subscription cleanup

### Newsletter
- Public subscribe widget
- Admin subscriber management with search and pagination
- CSV export of active subscribers (with injection protection)
- 7-day and 30-day trend stats

### Admin Dashboard & Reports
- Platform-wide KPI dashboard with bar and donut charts
- Filtered reports: Events, Bookings, Users, Vendors, Reviews
- CSV and Excel export with styled headers
- Date range, status, role, and text search filters

### Gallery
- Admin image upload with event assignment
- Publish/unpublish workflow
- Public gallery with responsive grid and full-screen lightbox
- Keyboard navigation (Escape, arrow keys)

### Error Handling
- Global error boundary (`error.tsx`) for all routes
- Route-specific error boundaries for admin, vendor, dashboard
- Custom 404 pages with navigation
- Loading skeleton states for all major routes

## Architecture

### Three-Layer Pattern

```
Route Handlers / Pages  →  Services  →  Prisma Client  →  PostgreSQL
         ↓                    ↓
    Validators           Business Logic
    (Zod)             (transactions, guards)
```

- **Route Handlers** — thin controllers that parse requests, call services, and return responses
- **Services** — all business logic, database queries, and domain rules live here
- **Validators** — Zod schemas at the API boundary for input validation

### Server Components First

Dashboard, admin, and public pages are async React Server Components that call service functions directly. Client components (`'use client'`) are used only where interactivity is required (forms, lightbox, ticket selection, real-time state).

### Transaction Safety

Critical operations use `prisma.$transaction()` with optimistic concurrency checks:
- Booking creation/cancellation with capacity guards
- Vendor approval with status transitions
- Ticket check-in with `updateMany` race-condition prevention

### Shared Utilities

- `src/lib/format.ts` — centralized date, time, currency, and CSV formatting
- `src/lib/rate-limit.ts` — in-memory rate limiting for API endpoints
- `src/lib/auth-utils.ts` — role-checking helpers
- `src/lib/date-utils.ts` — relative time formatting
- `src/lib/image.ts` — file upload abstraction

### Database Design Principles

- **Decimal(10, 2)** for all money fields (never Float)
- **Enums** for all status/role fields (DB-level validation)
- **cuid()** IDs (collision-resistant, URL-safe)
- **createdAt / updatedAt** on every model
- Explicit indexes on foreign keys and commonly filtered fields

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kids-family-fun-day-kenya.git
cd kids-family-fun-day-kenya

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:migrate:deploy` | Run database migrations (prod) |
| `npm run prisma:studio` | Open Prisma Studio |

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon **pooled** URL) |
| `DIRECT_URL` | PostgreSQL direct connection string (for migrations) |
| `AUTH_SECRET` | NextAuth JWT secret (generate with `npx auth secret`) |
| `AUTH_URL` | App base URL (e.g., `http://localhost:3000`) |

### Optional — Email

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `EMAIL_FROM` | Sender address (e.g., `noreply@kidsfamilyfunday.co.ke`) |

### Optional — Push Notifications

| Variable | Description |
|---|---|
| `VAPID_PUBLIC_KEY` | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | VAPID private key for web push |
| `VAPID_SUBJECT` | Contact email for push service |

### Optional — Payments (M-Pesa)

| Variable | Description |
|---|---|
| `MPESA_CONSUMER_KEY` | Safaricom Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja consumer secret |
| `MPESA_SHORTCODE` | M-Pesa shortcode |
| `MPESA_PASSKEY` | Daraja API passkey |
| `MPESA_ENVIRONMENT` | `sandbox` or `production` |

### Optional — Media

| Variable | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Optional — App Config

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CHECKIN_BASE_URL` | Public URL for QR check-in links |

## Database

### Models (15)

```
User ──┬── Vendor ──── Service
       ├── Sponsor ─── EventSponsor (join)
       ├── Booking ─── BookingItem ─── TicketType
       │       │── Payment
       │       └── Ticket (QR code)
       ├── Review
       ├── Notification
       ├── PushSubscription
       └── Event ── Category
                 ├── Gallery
                 ├── TicketType
                 ├── Booking
                 ├── Review
                 └── EventSponsor

NewsletterSubscriber (standalone)
```

### Key Enums

| Enum | Values |
|---|---|
| `UserRole` | CUSTOMER, VENDOR, SPONSOR, ADMIN |
| `EventStatus` | DRAFT, PUBLISHED, SOLD_OUT, CANCELLED, COMPLETED |
| `BookingStatus` | REQUESTED, CONFIRMED, DECLINED, COMPLETED, CANCELLED |
| `VendorStatus` | PENDING_REVIEW, APPROVED_AWAITING_PAYMENT, ACTIVE, REJECTED |
| `SponsorTier` | BRONZE, SILVER, GOLD, PLATINUM |
| `TicketStatus` | VALID, USED, CANCELLED, REFUNDED |
| `ReviewStatus` | PUBLISHED, HIDDEN |
| `ServiceCategory` | CATERING, PHOTOGRAPHY, ENTERTAINMENT, DECORATIONS, EQUIPMENT_RENTAL, KIDS_ACTIVITIES, TRANSPORT, OTHER |

### Migrations

8 migrations tracked in `prisma/migrations/`. Apply with:

```bash
npx prisma migrate dev    # Development
npx prisma migrate deploy # Production
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # Global 404 page
│   ├── loading.tsx               # Global loading state
│   ├── auth/                     # Login, register
│   ├── admin/                    # Admin portal (10 sections)
│   │   ├── error.tsx             # Admin error boundary
│   │   └── loading.tsx           # Admin loading skeleton
│   ├── vendor/                   # Vendor portal
│   │   └── loading.tsx           # Vendor loading skeleton
│   ├── dashboard/                # Customer dashboard
│   │   └── loading.tsx           # Dashboard loading skeleton
│   ├── events/                   # Public event pages
│   ├── gallery/                  # Public gallery
│   ├── services/                 # Public service pages
│   ├── vendors/                  # Public vendor profiles
│   ├── become-a-vendor/          # Vendor registration
│   ├── checkin/                  # QR code check-in
│   └── api/                      # API routes (30+ endpoints)
├── components/                   # React components
│   ├── auth/                     # Auth forms
│   ├── bookings/                 # Ticket display, QR, cancel
│   ├── charts/                   # BarChart, DonutChart
│   ├── dashboard/                # Shell, nav, stat cards
│   ├── events/                   # Event forms and cards
│   ├── gallery/                  # Lightbox
│   ├── newsletter/               # Signup widget
│   ├── reviews/                  # Review section
│   ├── ticket-types/             # Ticket type management
│   ├── tickets/                  # Ticket selection
│   └── vendor/                   # Vendor forms and cards
├── services/                     # Business logic layer
├── validators/                   # Zod schemas
├── lib/                          # Utilities and config
│   ├── format.ts                 # Shared date/time/currency formatters
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── auth-utils.ts             # Role-checking helpers
│   ├── date-utils.ts             # Relative time formatting
│   ├── email.ts                  # Resend email client
│   ├── image.ts                  # File upload abstraction
│   └── prisma.ts                 # Prisma client singleton
├── types/                        # TypeScript type augmentations
└── generated/                    # Prisma generated client
```

## API Routes

### Public

| Method | Route | Description |
|---|---|---|
| GET | `/api/events` | List published events |
| GET | `/api/gallery` | List published gallery images |
| POST | `/api/newsletter` | Subscribe to newsletter |
| GET | `/api/reviews` | Get event reviews |
| POST | `/api/reviews` | Submit a review (rate-limited) |
| POST | `/api/vendors/register` | Register as a vendor |
| GET | `/api/vendors/marketplace` | List vendors |
| GET | `/api/vendors/marketplace/[vendorId]` | Vendor profile |

### Authenticated

| Method | Route | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| POST | `/api/bookings/[id]/cancel` | Cancel a booking |
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications` | Mark notifications read |
| POST | `/api/push/subscribe` | Subscribe to web push |
| POST | `/api/push/unsubscribe` | Unsubscribe from web push |
| POST | `/api/upload` | Upload an image file (rate-limited) |

### Vendor

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/vendor/services` | List / create services |
| GET/PUT/DELETE | `/api/vendor/services/[serviceId]` | Manage a service |

### Admin

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/admin/events` | List / create events |
| GET/PUT/DELETE | `/api/admin/events/[id]` | Manage an event |
| GET/POST | `/api/admin/events/[id]/ticket-types` | Manage ticket types |
| PUT/DELETE | `/api/admin/ticket-types/[id]` | Manage a ticket type |
| GET | `/api/admin/users` | List users |
| GET/PATCH | `/api/admin/users/[userId]` | View / update user |
| POST | `/api/admin/users/[userId]/suspend` | Suspend user |
| POST | `/api/admin/users/[userId]/reactivate` | Reactivate user |
| GET | `/api/admin/vendors` | List vendors |
| GET/PATCH | `/api/admin/vendors/[vendorId]` | Review vendor |
| GET/POST | `/api/admin/sponsors` | List / create sponsors |
| GET/PATCH/DELETE | `/api/admin/sponsors/[sponsorId]` | Manage a sponsor |
| POST | `/api/admin/sponsors/[sponsorId]/publish` | Toggle publish |
| GET/POST | `/api/admin/gallery` | List / create gallery images |
| GET/PATCH/DELETE | `/api/admin/gallery/[imageId]` | Manage a gallery image |
| POST | `/api/admin/gallery/[imageId]/publish` | Toggle publish |
| GET | `/api/admin/newsletter` | List subscribers |
| DELETE | `/api/admin/newsletter/[subscriberId]` | Remove subscriber |
| GET | `/api/admin/newsletter/export` | Export subscribers CSV |
| GET | `/api/admin/reports` | Report data |
| POST | `/api/admin/reports/export` | Export report (CSV / Excel) |

## Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#14213D` | Primary dark, text |
| `paper` | `#FFFDF7` | Background |
| `coral` | `#FF6B5B` | CTA buttons, danger |
| `sky` | `#2FA8E0` | Links, info accents |
| `grass` | `#3FA66A` | Success, active states |
| `sun` | `#FFC13B` | Warnings, highlights |

### Typography

| Class | Font | Usage |
|---|---|---|
| `font-display` | Plus Jakarta Sans | Headings, stat values |
| `font-body` | Inter | Body text, labels |
| `font-mono` | IBM Plex Mono | Ticket codes, data |

### Component Classes

| Class | Description |
|---|---|
| `.btn-primary` | Coral background, white text |
| `.btn-secondary` | Outlined, ink border |
| `.input-base` | Styled form input |
| `.ticket-panel` | Ticket stub visual with perforation |
| `.animate-fade-in` | Fade-in animation |
| `.animate-slide-up` | Slide-up animation |

## Role-Based Access

### Customer (`/dashboard/*`)
Browse events → Purchase tickets → View bookings & QR tickets → Write reviews → Receive push notifications

### Vendor (`/vendor/*`)
Manage services → View bookings & revenue → Analytics dashboard → Receive notifications

### Admin (`/admin/*`)
Full platform control: Events → Users → Vendors → Sponsors → Gallery → Newsletter → Reports → Analytics → QR Check-in

### Access Control

- **Middleware** — redirects unauthenticated users to `/auth/login` for protected routes
- **Layout guards** — each portal layout checks `auth()` and redirects unauthorized roles
- **API guards** — `requireAdmin()` in every admin API route
- **JWT strategy** — user ID and role embedded in token, available in both server and edge runtime
- **Rate limiting** — in-memory rate limiting on file upload and review submission endpoints

## Deployment

### Production Build

```bash
npm run build
npm start
```

The app uses `output: 'standalone'` mode for optimized deployment.

### Security Headers

Configured in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Environment Setup

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL` and `DIRECT_URL` to your PostgreSQL connection strings
3. Generate `AUTH_SECRET` with `npx auth secret`
4. Set `AUTH_URL` and `NEXT_PUBLIC_CHECKIN_BASE_URL` to your production domain
5. Configure optional services (Resend, VAPID, M-Pesa, Cloudinary)

### Database Migrations

```bash
npx prisma migrate deploy
```

---

Built with Next.js 16, Prisma 7, and Tailwind CSS 4.
