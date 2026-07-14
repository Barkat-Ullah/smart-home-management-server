# AGENTS.md — Smart Home Management Server

## Quick Start

```bash
npm install                    # installs deps + runs prisma generate (postinstall)
npm run dev                    # ts-node-dev with hot reload on port 5000
npm run build                  # prisma generate && tsc → dist/
npm start                      # node ./dist/server.js (production)
```

## Prisma (MongoDB)

Schema is split across `prisma/*.prisma` files. The root `prisma/schema.prisma` only declares the datasource.

```bash
npx prisma generate            # regenerate client after schema changes
npx prisma migrate dev         # create migration
npx prisma db push             # push schema without migration (dev only)
```

After schema changes, always run `npx prisma generate` before building.

## Linting & Formatting

```bash
npm run lint:check             # eslint check
npm run lint:fix               # eslint --fix
npm run prettier:check         # prettier write (check mode: --check)
npm run prettier:fix           # prettier --write .
```

Prettier config: semicolons, single quotes, arrow parens avoided.
ESLint enforces: `prefer-const`, `no-unused-vars` as error, `consistent-type-definitions: type`.

## Architecture

```
src/
├── server.ts          # Entry point — seeds admin, starts HTTP server
├── app.ts             # Express app setup, middleware, routes
├── config/index.ts    # Centralized env config (dotenv)
├── lib/redis.ts       # Redis client + cache helpers (cacheOr, CacheInvalidator)
├── shared/index.ts    # Shared middleware (rate limiter, CORS, compression, logger)
├── app/
│   ├── modules/       # Feature modules (27 modules)
│   ├── middlewares/    # auth, error handler, validation, etc.
│   ├── routes/        # Route registration (imports.ts + index.ts)
│   ├── utils/         # Shared utilities (prisma, mail, file upload, tokens)
│   └── db/            # Seed data (super admin, activities, subscriptions)
├── helpers/           # Queue workers, email sender, WebSocket, JWT
└── types/             # TypeScript type extensions
```

## Module Pattern

Each module follows: `routes.ts → controller.ts → service.ts → validation.ts`

- **Routes**: Express router, applies auth middleware and role guards
- **Controller**: Thin handler, calls service
- **Service**: Business logic, Prisma queries, cache operations
- **Validation**: Zod schemas for request body/params

## Caching (Redis)

Use `cacheOr()` from `src/lib/redis.ts` for read-through caching:

```typescript
import { cacheOr, CacheKeys, TTL, CacheInvalidator } from '../../lib/redis';

// Read with cache
const user = await cacheOr(CacheKeys.single('user', id), TTL.MEDIUM, () =>
  prisma.user.findUnique({ where: { id } })
);

// Invalidate on update
await CacheInvalidator.onRecordUpdate('user', id);
```

TTL constants: `SHORT` (10m), `MEDIUM` (30m), `LONG` (6h), `DAY` (24h).

Cache key convention: `<model>:id:<id>` for single, `<model>:list:<hash>` for lists.

## Auth & Roles

Roles: `USER`, `ADMIN`, `CAREGIVER`, `FAMILYMEMBER`, `MODERATOR`

```typescript
router.get('/protected', auth(), handler);                    // any authenticated user
router.get('/admin-only', auth(UserRoleEnum.ADMIN), handler); // admin only
```

Auth middleware validates JWT, checks session cache, verifies user status.

## Error Handling

- Throw `ApiError` from `src/app/errors/AppError.ts` with status code and message
- `globalErrorHandler` catches Zod, Prisma, and AppError instances
- Use `catchAsync()` wrapper for all route handlers

## Environment Variables

Required env vars (see `.env.example`):
- `DATABASE_URL` — MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT` — Redis connection
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — JWT signing
- `SUPER_ADMIN_MAIL`, `SUPER_ADMIN_PASSWORD` — Seed admin
- `STRIPE_*` — Payment integration
- `DO_SPACE_*` — DigitalOcean Spaces (file storage)

## Background Jobs

BullMQ queues handle: medicine reminders, event reminders, dose logging, email sending.

Workers are in `src/helpers/worker/`. Queue config in `src/helpers/queue/`.

Docker Compose runs a separate `worker` container with `IS_WORKER=true`.

## Key Gotchas

- **Prisma imports**: Use `insecurePrisma` for queries accessing sensitive fields (password, OTP). Both exports point to same client — name is documentation only.
- **Email sending**: Always fire-and-forget with `.catch()` to avoid blocking responses.
- **Validation**: Request body may come as `req.body.data` (JSON string) — middleware parses it.
- **File uploads**: Use `/api/v1/upload-document` endpoint, then reference URL in your entity.
- **Rate limiting**: 2000 requests per 15 minutes per IP on `/api/v1/*` routes.
- **API security**: Most routes require `x-api-key` and `x-api-access-token` headers (see `secureApi.ts`).

## Testing

No test framework configured yet (`npm test` returns error). When adding tests, check for a test runner config first.

## Performance Plan

Active optimization work documented in `docs/compose/plans/PERFORMANCE_PLAN.md` — check for pending tasks before making database or caching changes.
