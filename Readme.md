# Smart Home Management Server

Production-grade REST API for comprehensive smart home and family management. Built with **Node.js, Express 5, TypeScript, Prisma, MongoDB, and Redis**.

Covers family care, health tracking, meal planning, home automation, finance, and real-time communication.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22+ |
| Framework | Express 5 |
| Language | TypeScript 5.8 (strict mode) |
| ORM | Prisma 6.9 (MongoDB adapter) |
| Database | MongoDB (Atlas) |
| Cache | Redis 7 (ioredis) |
| Job Queue | BullMQ 5.79 (repeatable + one-shot jobs) |
| Real-time | Socket.IO (chat) + Server-Sent Events (notifications) |
| Auth | JWT (access + refresh) + bcrypt |
| Validation | Zod (request body, params, query) |
| File Storage | Cloudinary + DigitalOcean Spaces (AWS S3) |
| Payment | Stripe (checkout sessions + webhooks) |
| Email | Nodemailer + SendGrid |
| Push | Firebase Cloud Messaging (FCM) |
| SMS | Twilio |
| AI | Google Generative AI (Gemini) + Groq |
| API Docs | Swagger / OpenAPI |
| Security | Helmet, CORS, Rate Limiting, Compression |
| Logging | Winston |
| PDF | pdf-parse (prescription upload) |

---

## Architecture

```
src/
├── server.ts                  # Entry point — seeds, starts HTTP server, initializes jobs
├── app.ts                     # Express app setup, middleware, route registration
├── config/                    # Centralized env config (dotenv)
│
├── app/
│   ├── modules/               # Feature modules (27 modules)
│   │   ├── auth/              # Register, login, OTP, JWT
│   │   ├── user/              # Profile, avatar, analytics
│   │   ├── child/             # Child profiles, health, school
│   │   ├── familyMember/      # Family relationships
│   │   ├── feed/              # Support feed, comments, reactions
│   │   ├── event/             # Calendar events, categories, reminders
│   │   ├── notifications/     # In-app + SSE push notifications
│   │   ├── medicineReminder/  # Medicine reminder CRUD + generation
│   │   ├── medicineSchedule/  # Schedules, dose generation, status
│   │   ├── doseLog/           # Dose tracking, adherence reports
│   │   ├── prescription/      # Prescription upload + management
│   │   ├── meal/              # Recipe library
│   │   ├── mealPlanDay/       # Daily meal planning
│   │   ├── mealPlanDayItem/   # Individual meal items
│   │   ├── weeklyMealPlan/    # Weekly plan generation
│   │   ├── houseroom/         # Room management (6 default + 2 custom)
│   │   ├── cctvCamera/        # CCTV stream URLs
│   │   ├── airConditioner/    # AC state + smart control
│   │   ├── smartDevice/       # Generic IoT device management
│   │   ├── financial/         # Income, expenses, budgets, goals
│   │   ├── inventory/         # Household supply tracking
│   │   ├── memory/            # Shared photos/notes
│   │   ├── subscription/      # Plan management
│   │   ├── payment/           # Stripe checkout + webhooks
│   │   ├── follow/            # User follow system
│   │   ├── favorite/          # Favorites/bookmarks
│   │   └── article/           # Admin articles/resources
│   │
│   ├── middlewares/            # Auth, error handler, validation, body parser
│   ├── routes/                # Route registration (imports + index)
│   ├── utils/                 # Shared utilities (prisma, mail, tokens, SSE, Stripe)
│   ├── errors/                # ApiError, Zod error handler
│   ├── interface/             # TypeScript interfaces (pagination, etc.)
│   ├── db/                    # Seed data (super admin, activities, subscriptions)
│   └── ai/                    # AI integration (Gemini, Groq)
│
├── jobs/                      # Background job processors (BullMQ)
│   ├── doseLog.job.ts         # Auto-mark missed doses (every 5 min)
│   ├── medicineReminder.job.ts# Send due medicine reminders (every 1 min)
│   ├── eventReminder.job.ts   # Send event reminders (every 5 min)
│   ├── customReminder.job.ts  # On-demand custom reminder queue
│   └── index.ts               # Job initialization + graceful shutdown
│
├── helpers/                   # Infrastructure layer
│   ├── queue/                 # BullMQ queue factory + instances
│   ├── queue-manager/         # Queue initialization, status, graceful shutdown
│   ├── worker/                # OTP worker, email worker, subscription worker
│   ├── emailSender/           # Nodemailer transport
│   ├── phoneSmsSender/        # Twilio SMS
│   ├── cleanQueue/            # Queue cleanup utilities
│   ├── queueMonitor/          # Bull Board dashboard
│   ├── jwtHelpers.ts          # Token generation
│   └── webSocket.ts           # Socket.IO setup
│
├── lib/
│   ├── redis.ts               # Redis client, cache helpers, CacheInvalidator
│   └── redisConnection.ts     # Re-export bridge
│
├── shared/                    # Shared middleware (rate limiter, CORS, compression, logger)
└── types/                     # TypeScript type extensions
```

---

## Module Pattern

Every feature module follows a consistent structure:

```
modules/<name>/
├── <name>.routes.ts       # Express router, auth middleware, role guards
├── <name>.controller.ts   # Thin handler — parses request, calls service
├── <name>.service.ts      # Business logic, Prisma queries, cache ops
├── <name>.validation.ts   # Zod schemas for request validation
├── <name>.select.ts       # Prisma select field projections
└── <name>.utils.ts        # Filter builders, helpers
```

---

## Background Jobs

BullMQ repeatable jobs run inside the main server process. No separate worker container needed for scheduled tasks.

| Job | Queue | Schedule | Description |
|-----|-------|----------|-------------|
| `doseLog.job` | `dose-log-processing` | Every 5 min | Finds active schedules with past due times, creates `Missed` dose logs, sends `MedicineMissed` notification |
| `medicineReminder.job` | `medicine-reminder-processing` | Every 1 min | Picks up `Pending` reminders where `remindAt <= now`, sends `MedicineDue` notification, updates status to `Sent` |
| `eventReminder.job` | `event-reminder-processing` | Every 5 min | Checks upcoming events within `reminderMinutes`, sends `EventReminder` notification, marks `isReminderSent` |
| `customReminder.job` | `custom-reminder-processing` | On-demand | Queue for ad-hoc reminders — use `addCustomReminder()` to enqueue with optional delay |

Additional queue workers (run in the same process):

| Worker | Queue | Purpose |
|--------|-------|---------|
| `otpWorker` | `otp-queue` | Send OTP via email or SMS |
| `emailWorker` | `mail-queue` | Transactional emails (welcome, password reset, bulk) |
| `subscriptionWorker` | `subscription-processing` | Post-payment notifications to user + admin |

**Graceful shutdown**: All queues and workers are closed on `SIGINT`/`SIGTERM` before the HTTP server shuts down.

---

## Caching (Redis)

```typescript
import { cacheOr, CacheKeys, TTL, CacheInvalidator } from '../lib/redis';

// Read-through cache with stampede + penetration + avalanche protection
const user = await cacheOr(CacheKeys.single('user', id), TTL.MEDIUM, () =>
  prisma.user.findUnique({ where: { id } })
);

// Invalidate on update
await CacheInvalidator.onOwnedRecordUpdate('user', id, userId);
```

| TTL Constant | Value | Use Case |
|-------------|-------|----------|
| `SHORT` | 10 min | Paginated/filtered lists |
| `MEDIUM` | 30 min | Single record by ID |
| `LONG` | 6 h | Rarely-changing data |
| `DAY` | 24 h | Static/config data |

Cache key convention: `<model>:id:<id>` for single, `<model>:list:<hash>` for lists, `<model>:my:<userId>:<hash>` for user-scoped.

---

## Authentication & Authorization

```
Roles: USER | ADMIN | CAREGIVER | FAMILYMEMBER | MODERATOR
```

| Route Type | Middleware |
|-----------|-----------|
| Public | None |
| Authenticated | `auth()` |
| Admin only | `auth(UserRoleEnum.ADMIN)` |
| Role-scoped | `auth(role1, role2, ...)` |

JWT flow: Access token (short-lived) + Refresh token (long-lived). Refresh tokens stored in Redis with TTL. Logout blacklists the access token.

---

## API Response Format

```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

Error format:

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errorSources": [
    { "path": "email", "message": "Invalid email format" }
  ]
}
```

---

## Prisma (MongoDB)

Schema is split across `prisma/*.prisma` files. The root `schema.prisma` declares the datasource; each feature has its own file.

```bash
npx prisma generate            # Regenerate client after schema changes
npx prisma migrate dev         # Create migration
npx prisma db push             # Push schema without migration (dev only)
```

Models: `User`, `Child`, `FamilyMember`, `Prescription`, `MedicineSchedule`, `DoseLog`, `MedicineReminder`, `Event`, `Notification`, `Feed`, `Comment`, `Reaction`, `Meal`, `MealPlanDay`, `WeeklyMealPlan`, `HouseRoom`, `CctvCamera`, `AirConditioner`, `SmartDevice`, `FinancialProfile`, `Transaction`, `Budget`, `FinancialGoal`, `Inventory`, `Memory`, `Subscription`, `Payment`, `UserSubscription`, and more.

---

## Environment Variables

```env
# App
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb+srv://...

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Super Admin (seeded on startup)
SUPER_ADMIN_MAIL=admin@example.com
SUPER_ADMIN_PASSWORD=secure_password

# Cloudinary / DO Spaces
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DO_SPACE_ENDPOINT=
DO_SPACE_BUCKET=
DO_SPACE_KEY=
DO_SPACE_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Firebase (FCM)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI
GOOGLE_AI_KEY=
GROQ_API_KEY=
```

---

## Getting Started

```bash
# Install dependencies (runs prisma generate via postinstall)
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:5000`. Swagger docs available at `/api/v1/docs`.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | ts-node-dev with hot reload |
| `npm run build` | prisma generate + tsc |
| `npm start` | node ./dist/server.js |
| `npm run lint:check` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run prettier:check` | Prettier check |
| `npm run prettier:fix` | Prettier format |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Push schema changes (dev) |

---

## Key Design Decisions

- **Modular architecture**: Each feature is self-contained with its own routes, controller, service, validation, and types
- **Read-through caching**: `cacheOr()` handles stampede protection, negative caching, and TTL jitter automatically
- **Fire-and-forget notifications**: Email/push sends use `.catch()` to avoid blocking request responses
- **BullMQ repeatable jobs**: Scheduled tasks (dose tracking, reminders) run as repeatable BullMQ jobs inside the server process — no separate worker container needed
- **Prisma select projections**: Each module defines explicit select objects to avoid over-fetching
- **Validation at boundaries**: Zod validates all external input; internal code trusts types
- **Graceful shutdown**: SIGINT/SIGTERM handlers close HTTP server, all job queues, and Redis connections in order

---

## License

ISC
