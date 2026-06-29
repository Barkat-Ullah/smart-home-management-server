# Performance Optimization Plan — Smart Home Management Server

**Date:** June 29, 2026  
**Based on:** PERFORMANCE_AUDIT.md findings  
**Strategy:** Iterative, ROI-prioritized implementation with no breaking changes

---

## Optimization Roadmap

We will implement optimizations in 4 phases, starting with highest ROI and lowest risk:

| Phase | Focus Area | Est. Effort | Est. Impact |
|-------|-----------|-------------|-------------|
| **Phase 1** | Database + Caching (P0 items) | 2-3 days | 60-80% DB read reduction |
| **Phase 2** | Application Layer (P1 items) | 2-3 days | 40-60% latency reduction |
| **Phase 3** | Infrastructure (P2 items) | 1-2 days | 30-50% P99 improvement |
| **Phase 4** | Queues + Cleanup (P3-P4 items) | 0.5-1 day | 10-20% consistency gain |

---

## Phase 1 — Database & Caching (Critical)

### Task 1.1: Add Redis Caching to All List Endpoints

**Files to modify:** 
- `src/app/modules/financial/financial.service.ts`
- `src/app/modules/event/event.service.ts`
- `src/app/modules/user/user.service.ts`
- `src/app/modules/child/child.service.ts`
- `src/app/modules/familyMember/familyMember.service.ts`
- `src/app/modules/inventory/inventory.service.ts`
- `src/app/modules/medicineSchedule/medicineSchedule.service.ts`
- `src/app/modules/medicineReminder/medicineReminder.service.ts`
- `src/app/modules/meal/meal.service.ts`
- `src/app/modules/mealPlanDay/mealPlanDay.service.ts`
- `src/app/modules/mealPlanDayItem/mealPlanDayItem.service.ts`
- `src/app/modules/prescription/prescription.service.ts`
- `src/app/modules/doseLog/doseLog.service.ts`
- `src/app/modules/memory/memory.service.ts`
- `src/app/modules/houseroom/houseroom.service.ts`
- `src/app/modules/smartDevice/smartDevice.service.ts`
- `src/app/modules/airConditioner/airConditioner.service.ts`
- `src/app/modules/cctvCamera/cctvCamera.service.ts`
- `src/app/modules/notification/notification.service.ts`

**Pattern to apply:**
```typescript
// BEFORE
const [result, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit, where: ..., orderBy: ..., select: ... }),
  prisma.model.count({ where: ... }),
]);
return { meta: { total, page, limit }, data: result };

// AFTER
const cacheKey = CacheKeys.list('model', { ...options, ...filters });
return cacheOr(cacheKey, TTL.SHORT, async () => {
  const [result, total] = await Promise.all([
    prisma.model.findMany({ skip, take: limit, where: ..., orderBy: ..., select: ... }),
    prisma.model.count({ where: ... }),
  ]);
  return { meta: { total, page, limit }, data: result };
}) ?? { meta: { total: 0, page, limit }, data: [] };
```

**Cache invalidation:** Add `CacheInvalidator.onRecordCreate('model')` in create, `CacheInvalidator.onOwnedRecordUpdate('model', id, userId)` in update, `CacheInvalidator.onRecordDelete('model', id, userId)` in delete.

**Expected impact:**
- Response time: 200-500ms → 10-30ms (cached)
- Database load: 60-80% reduction in read queries
- Risk: Very low — cache-or pattern with negative caching handles misses gracefully

---

### Task 1.2: Defer Financial Profile Recalculation via BullMQ

**Files to modify:** `src/app/modules/financial/financial.utils.ts`, `src/app/modules/financial/financial.service.ts`

**Implementation:**
1. Create a new BullMQ queue `financial-recalculation` in `src/helpers/queue/index.ts`
2. Create a worker `recalculationWorker.ts` in `src/helpers/worker/`
3. Replace synchronous calls to `recalculateProfileTotals()` and `recalculateBudgetSpend()` with queue job pushes
4. The worker processes profile recalculations asynchronously

**Alternative (simpler, chosen):** Implement **incremental recalculation** — instead of 4 full aggregations, add/subtract the transaction amount from running totals:

```typescript
// INCREMENTAL APPROACH (preferred for Phase 1 - lower effort)
const updateTotals = {
  totalIncome: { increment: data.type === 'Income' ? data.amount : 0 },
  totalExpense: { increment: data.type === 'Expense' ? data.amount : 0 },
  totalSaving: { increment: data.type === 'Saving' ? data.amount : 0 },
  totalInvestment: { increment: data.type === 'Investment' ? data.amount : 0 },
  netBalance: { increment: data.type === 'Income' ? data.amount : (data.type === 'Expense' ? -data.amount : 0) },
};

await prisma.financialProfile.update({
  where: { id: financialProfileId },
  data: updateTotals,
});
```

**Expected impact:**
- Write latency: 300-800ms → 30-80ms
- Aggregation queries eliminated entirely for normal CRUD
- Risk: Low — incremental updates may drift; schedule periodic full recalibration (e.g., daily cron)

---

### Task 1.3: Optimize Financial Snapshot with MongoDB Aggregation

**File to modify:** `src/app/modules/financial/financial.service.ts` (lines 845-917)

**Implementation:** Replace in-memory aggregation with MongoDB native aggregation:

```typescript
const pipeline = [
  { $match: { userId: new ObjectId(userId), isDeleted: false, date: { $gte: startDate, $lte: endDate } } },
  { $group: {
    _id: null,
    totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] } },
    totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] } },
    totalSaving: { $sum: { $cond: [{ $eq: ['$type', 'Saving'] }, '$amount', 0] } },
    totalInvestment: { $sum: { $cond: [{ $eq: ['$type', 'Investment'] }, '$amount', 0] } },
    categoryBreakdown: { $push: { k: '$category', v: '$amount' } },
  }},
];

// For weekly breakdown, add $bucket stage
```

**Expected impact:**
- Memory: 90% reduction (no in-memory iteration)
- Response time: 500ms-3s → 50-200ms
- Risk: Low — uses MongoDB native capabilities

---

### Task 1.4: Split Feed Select for List vs Detail

**Files to modify:** `src/app/modules/feed/feed.select.ts`, `src/app/modules/feed/feed.service.ts`

**Implementation:**
1. Create `feedListSelect` — minimal fields + `_count` + `createdBy` + 1st level of assignments
2. Keep `feedSelect` as `feedDetailSelect` — full nested includes
3. Update `getFeedList()` and `getMyFeed()` to use `feedListSelect`
4. Keep `getFeedById()` using `feedDetailSelect`

**Expected impact:**
- List payload: ~80% reduction (removes comments, statusHistory, deep assignment details)
- Query time: 50% reduction
- Risk: Very low — pure refactor, no behavior change

---

## Phase 2 — Application Layer (High Impact)

### Task 2.1: Move All Emails to BullMQ Queue

**Files to modify:**
- `src/app/modules/auth/auth.service.ts` (6 email calls)
- `src/app/modules/user/user.service.ts` (3 email calls)
- `src/app/utils/sendMail.ts`

**Implementation:**
1. Create a standardized email job type:
```typescript
// types
interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  priority?: 'low' | 'normal' | 'high';
}
```
2. Replace all `emailSender(...)` calls with `mailQueue.add('send-email', emailJobData)`
3. Update `emailWorker.ts` to handle generic email jobs

**Expected impact:**
- Auth response time: 2-5s → 100-200ms
- Email delivery becomes reliable with retries
- Risk: Low — queue infrastructure already exists

---

### Task 2.2: Optimize Auth Middleware

**File to modify:** `src/app/middlewares/auth.ts`

**Implementation:**
1. Reduce TTL for auth session cache to 2 minutes (faster invalidation)
2. Add early return for role-only checks (skip DB if token role matches)
3. Cache `lastLogoutAt` in a lightweight Redis key instead of full session object

**Expected impact:**
- Middleware overhead: 3-5ms → <1ms
- Redis operations per request: 1 GET → 0 (for most cases)
- Risk: Low — maintains existing security guarantees

---

### Task 2.3: Reuse S3 Client for ZenexCloud

**File to modify:** `src/app/utils/fileUploader.ts`

**Implementation:**
```typescript
// Hoist ZenexCloud client to module level (line ~19)
const zenexClient = new S3Client({
  region: process.env.ZENEX_REGION || 'us-east-1',
  endpoint: (process.env.ZENEX_ENDPOINT || 'http://vault.zenexcloud.com:9000').replace(/\/$/, ''),
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.ZENEX_ACCESS_KEY || '',
    secretAccessKey: process.env.ZENEX_SECRET_KEY || '',
  },
});

// Then use the reused client in uploadToZenexCloudWithType()
```

**Expected impact:**
- Upload latency: 100-300ms reduction (eliminates TLS handshake per upload)
- Risk: Very low — structural refactor

---

### Task 2.4: Cache Notification Unread Counts in Redis

**Files to modify:** `src/app/utils/notify.ts`

**Implementation:**
```typescript
// On createNotification:
await redis.incr(`notifications:unread:${receiverId}`);

// On createBulkNotifications:
await Promise.all(
  uniqueReceivers.map(id => redis.incr(`notifications:unread:${id}`))
);

// On mark-as-read (notification route):
await redis.set(`notifications:unread:${userId}`, '0', 'EX', TTL.SHORT);
```

**Expected impact:**
- Eliminates 1+N database count queries per notification batch
- Risk: Very low — unread count is eventually consistent anyway

---

## Phase 3 — Infrastructure (High Impact / Medium Risk)

### Task 3.1: Add Missing Database Indexes

**Files to modify:** Multiple `.prisma` schema files

**Indexes to add:**

| Model | Index | Justification |
|-------|-------|---------------|
| Notification | `[type, receiverId]` | Filtered notification queries |
| Chat | `[roomId, receiverId, isRead]` | Unread count queries |
| Feed | `[status, createdAt]` | Admin feed filtering |
| Transaction | `[financialProfileId, type, category, isDeleted]` | Recalculation aggregation |
| Transaction | `[financialProfileId, type, isDeleted]` | Profile total recalculation |
| DoseLog | `[userId, scheduledAt, status]` | User's scheduled dose queries |
| Event | `[userId, eventDate, status]` | Calendar view queries |
| MedicineSchedule | `[userId, status, startDate, endDate]` | Active schedule queries |

**Implementation:** Add `@@index([...])` decorators to each model, then run `npx prisma db push`.

**Risk:** Medium — adding indexes to large MongoDB collections can block writes. Use `prisma db push --accept-index-loss` or migrate during maintenance window.

**Expected impact:** 10-50x speed improvement on filtered queries

---

### Task 3.2: Increase Docker Container Resources

**File to modify:** `docker-compose.yml`

**Changes:**
```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1024M
      reservations:
        memory: 512M

worker:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1024M
      reservations:
        memory: 512M
```

**Expected impact:**
- P99 latency: 30-50% reduction under concurrent load
- Reduced GC pressure
- Risk: Low — Docker host needs available resources

---

### Task 3.3: Configure Winston for Async Logging

**File to modify:** `src/shared/index.ts`

**Implementation:**
```typescript
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.Console({ format: format.simple() }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
});
```

**Expected impact:** Prevents event loop blocking under high log volume

---

### Task 3.4: Add Global Request Timeout

**File to modify:** `src/app.ts`

**Implementation:**
```typescript
import timeout from 'express-timeout-handler';

app.use(timeout.handler({
  timeout: 30000, // 30 seconds
  onTimeout: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Request timed out',
    });
  },
}));
```

**Expected impact:** Prevents connection pool exhaustion during DB congestion

---

## Phase 4 — Housekeeping & Optimization (Medium-Low Priority)

### Task 4.1: Fix Queue Cleaner Duplication

**File to modify:** `src/helpers/cleanQueue/cleanOtpQueue.ts`

**Action:** Remove the `setInterval` at the bottom of the file (lines 24-29). Only keep the `cleanQueue` export function. The `queueManager.ts` already manages the interval.

---

### Task 4.2: Optimize Validation Middleware

**File to modify:** `src/app/middlewares/validateRequest.ts`

**Change:** Replace `parseAsync` with `parse` (sync) for small payloads, and avoid `JSON.parse` when body is already an object:

```typescript
const validateRequest = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      }
      schema.parse(req.body); // sync parse for speed
      return next();
    } catch (err) {
      next(err);
    }
  };
```

---

### Task 4.3: Remove Dead Code

**Files to remove/clean:**
- `src/helpers/emailSender/sendGridEmailSender.ts` — entire file is commented out
- `src/helpers/emailSender/sendGridBulkEmailSender.ts` — entire file is commented out
- `src/app/utils/StripeUtils.ts` — if unused (StripeWebHook import is commented in app.ts)

---

## Implementation Order (By Task ID)

| Order | Task ID | Description | Est. Time | Dependencies |
|-------|---------|-------------|-----------|--------------|
| 1 | 1.1 | Add Redis caching to list endpoints | 4h | None |
| 2 | 1.2 | Optimize financial recalculation | 2h | None |
| 3 | 1.3 | Optimize financial snapshot | 2h | None |
| 4 | 1.4 | Split feed select | 1h | None |
| 5 | 2.1 | Move emails to BullMQ | 2h | None |
| 6 | 2.2 | Optimize auth middleware | 1h | None |
| 7 | 2.3 | Reuse S3 client | 0.5h | None |
| 8 | 2.4 | Cache notification unread counts | 1h | None |
| 9 | 3.1 | Add database indexes | 1h | Prisma schema review |
| 10 | 3.2 | Increase Docker resources | 0.5h | Docker/compose |
| 11 | 3.3 | Configure async logging | 0.5h | None |
| 12 | 3.4 | Add request timeout | 0.5h | None |
| 13 | 4.1 | Fix queue cleaner duplication | 0.5h | None |
| 14 | 4.2 | Optimize validation middleware | 0.5h | None |
| 15 | 4.3 | Remove dead code | 0.5h | None |

**Total estimated implementation time:** 17.5 hours (approximately 3-4 days)

---

## Risk Assessment & Rollback Plan

| Change | Risk Level | Rollback Strategy |
|--------|-----------|-------------------|
| Redis caching | Low | Remove cache keys; data still in DB |
| Incremental financial totals | Low | Revert to aggregation queries |
| MongoDB aggregation pipeline | Low | Keep old code path as fallback |
| BullMQ email migration | Low | Emails still queued in Redis if worker fails |
| Database indexes | Medium | `prisma db push` can drop/recreate indexes |
| Docker resource changes | Low | Revert YAML changes |
| Code removal | Low | Git revert |

---

## Success Metrics

After implementation, we should measure:

1. **API Response Times:** P50, P95, P99 for top 10 endpoints
2. **Database Load:** MongoDB Atlas metrics (connections, ops/sec, latency)
3. **Redis Hit Rate:** Cache hit/miss ratio (target: >80%)
4. **Memory Usage:** Container RSS memory (target: <512MB under load)
5. **Error Rates:** 5xx responses (target: <0.1%)
6. **Email Delivery:** Queue depth, failure rate (target: <1%)

---

## Next Steps

1. Review this plan and provide feedback
2. Begin Phase 1 implementation (Task 1.1-1.4)
3. After Phase 1, re-measure and report results
4. Proceed to Phase 2-4 based on measured impact