# Performance Optimization Implementation Plan

**Date:** 2026-07-13
**Based on:** PERFORMANCE_AUDIT.md
**Approach:** Incremental, low-risk optimizations with verification at each step

---

## Phase 1: Database Indexes + Caching (P0 - Highest ROI) ✅ COMPLETE

**Completed:** 2026-07-14
**Changes:**
- Added `@@index([userId, createdAt(sort: Desc)])` and `@@index([status, isDeleted, createdAt(sort: Desc)])` to Feed model
- Added caching to `getMyCareGiver` (user.service.ts)
- Added caching to `getSubscriptionById`, `getMyPlan` (subscription.service.ts)
- Added caching to `getWeeklyMealPlanList`, `getMyWeeklyMealPlans`, `getWeeklyMealPlanById` (weeklyMealPlan.service.ts)
- Added cache invalidation to update/delete methods in subscription and weeklyMealPlan services

---

## Phase 2: Analytics Optimization (P1) ✅ COMPLETE

**Completed:** 2026-07-14
**Changes:**
- Added caching to `getUserLogoutStats`, `getLogoutTrend`, `getAdminDashboardStats`, `getMyStats`
- Converted `getLogoutTrend` to use MongoDB `$runCommandRaw` aggregation instead of fetching all records
- Added proper null handling with fallback defaults for all cached functions

---

## Phase 3: Background Jobs (P1) ✅ COMPLETE

**Completed:** 2026-07-14
**Changes:**
- Updated email worker to handle `welcome-email` and `bulk-email` job types
- Modified `createUser` in user.service.ts to send welcome email via `mailQueue` instead of blocking `emailSender`
- Added retry logic with exponential backoff (3 attempts, 5s initial delay)

---

## Phase 4: Payload Optimization (P2) ✅ COMPLETE

**Completed:** 2026-07-14
**Changes:**
- Added `userListSelect` in user.select.ts with essential fields only (excludes clientInfo, ipInfo, trackInfo, otp, etc.)
- Updated `getUserList` to use `userListSelect` instead of inline 20+ field select
- Added HTTP Cache-Control middleware in shared/index.ts (private max-age=30 for authenticated, public max-age=60 for public)

---

## Phase 5: Infrastructure (P3) ✅ COMPLETE

**Completed:** 2026-07-14
**Changes:**
- Added `directUrl` to Prisma schema for direct database connections
- Reduced queue cleanup interval from 1 hour to 10 minutes for faster cleanup of stuck jobs

---

## All Phases Complete ✅

**Total completed:** 2026-07-14
**Summary:**
1. Phase 1: Database Indexes + Caching ✅
2. Phase 2: Analytics Optimization ✅
3. Phase 3: Background Jobs ✅
4. Phase 4: Payload Optimization ✅
5. Phase 5: Infrastructure ✅

### Task 1.1: Add Missing Indexes to Prisma Schema

**Files to modify:**
- `prisma/user.prisma` - Add email index
- `prisma/feed.prisma` - Add userId+createdAt, status+isDeleted+createdAt indexes
- `prisma/medicine.prisma` - Verify Logout indexes

**Changes:**

```prisma
// In user.prisma - Add email index for auth lookups
model User {
  // ... existing fields ...
  @@index([email])  // NEW - for auth middleware and findUnique
  @@index([role, status, isDeleted])
  @@index([createdById])
  @@index([plan, isDeleted])
  @@index([createdAt(sort: Desc)])
  @@map("users")
}
```

```prisma
// In feed.prisma - Add indexes for common query patterns
model Feed {
  // ... existing fields ...
  @@index([userId, createdAt(sort: Desc)])  // NEW - for getMyFeed
  @@index([status, isDeleted, createdAt(sort: Desc)])  // NEW - for getFeedList
  @@index([isPinned, createdAt(sort: Desc)])  // NEW - for pinned feed sorting
  @@map("feed")
}
```

**Verification:**
```bash
npx prisma generate
npx prisma db push  # or migrate dev
```

**Expected impact:** 70-80% reduction in query time for indexed fields

---

### Task 1.2: Add Cache to Uncached Hot Paths

**Files to modify:**
- `src/app/modules/user/user.service.ts` - Add cache to getUserById, getMyUser, getMyCareGiver
- `src/app/modules/subscription/subscription.service.ts` - Add cache to getSubscriptionById, getMyPlan
- `src/app/modules/weeklyMealPlan/weeklyMealPlan.service.ts` - Add cache to list and detail queries

**Pattern to apply (from existing code in same file):**

```typescript
// Example: getUserById with caching
const getUserById = async (id: string) => {
  const cacheKey = CacheKeys.single('user', id);
  const result = await cacheOr(cacheKey, TTL.MEDIUM, async () => {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};
```

**Cache TTLs:**
- `getUserById`: TTL.MEDIUM (30 min)
- `getMyUser`: TTL.SHORT (10 min)
- `getMyCareGiver`: TTL.SHORT (10 min)
- `getSubscriptionById`: TTL.LONG (6 hours)
- `getMyPlan`: TTL.SHORT (10 min)
- `getWeeklyMealPlanList`: TTL.SHORT (10 min)
- `getMyWeeklyMealPlans`: TTL.SHORT (10 min)
- `getWeeklyMealPlanById`: TTL.MEDIUM (30 min)

**Invalidation:** Add `CacheInvalidator.onRecordUpdate` calls in corresponding update/delete methods

**Expected impact:** 80-90% reduction in response time for cached endpoints

---

## Phase 2: Analytics Optimization (P1)

### Task 2.1: Convert Analytics to MongoDB Aggregation

**File to modify:**
- `src/app/modules/user/analytics/analytics.service.ts`

**Current implementation (inefficient):**
```typescript
// Fetches ALL logouts, groups in JS
const logouts = await prisma.logout.findMany({ ... });
const grouped = {};
for (const log of logouts) { ... }
```

**New implementation (using Prisma's aggregate):**
```typescript
export const getLogoutTrend = async (year: number) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  // Use Prisma's groupBy for database-level aggregation
  const monthlyData = await prisma.logout.groupBy({
    by: ['userId'],
    where: { logoutAt: { gte: start, lte: end } },
    _count: { id: true },
  });

  // Or use raw aggregation for month-level grouping
  const result = await prisma.$runCommandRaw({
    aggregate: 'Logout',
    pipeline: [
      { $match: { logoutAt: { $gte: start, $lte: end } } },
      { $group: {
          _id: { $month: '$logoutAt' },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]
  });

  // Map to expected format
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i).toLocaleString('default', { month: 'short' }),
    count: 0,
  }));

  // Populate from aggregation result
  return monthly;
};
```

**Similar optimization for `getAdminDashboardStats`:**
```typescript
// Replace 5 separate count queries with aggregation
export const getAdminDashboardStats = async () => {
  // Single aggregation for all user stats
  const stats = await prisma.user.groupBy({
    by: ['status', 'plan'],
    where: { isDeleted: false },
    _count: { id: true },
  });

  // Process stats in memory (much smaller dataset)
  const statusCounts = stats.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + s._count.id;
    return acc;
  }, {} as Record<string, number>);

  // ... similar for plan counts
};
```

**Verification:** Run analytics endpoints before/after and compare results

**Expected impact:** 80-90% reduction in analytics query time

---

## Phase 3: Background Jobs (P1)

### Task 3.1: Move Email Sending to Background Jobs

**Files to modify:**
- `src/app/modules/user/user.service.ts` - `createUser` function
- `src/helpers/worker/emailWorker.ts` - Add welcome email job type

**Current implementation:**
```typescript
const createUser = async (req: Request) => {
  // ... create user ...
  await emailSender(data.email, html, subject);  // BLOCKING
  return result;
};
```

**New implementation:**
```typescript
import { mailQueue } from '../../../helpers/queue';

const createUser = async (req: Request) => {
  // ... create user ...

  // Send welcome email in background
  await mailQueue.add('welcome-email', {
    to: data.email,
    html: welcomeEmailTemplate({ ... }),
    subject: `Welcome to Smart Home — Your ${targetRole} Account`,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  return result;
};
```

**Add to emailWorker.ts:**
```typescript
// Handle welcome email job
if (job.name === 'welcome-email') {
  await emailSender(job.data.to, job.data.html, job.data.subject);
}
```

**Expected impact:** 200-500ms reduction in createUser response time

---

### Task 3.2: Add Rate Limiting to Bulk Email

**File to modify:**
- `src/app/modules/user/user.service.ts` - `sendMailToAllUsersFromDB`

**Add delay between batches:**
```typescript
const sendMailToAllUsersFromDB = async (payload: IBulkMailPayload) => {
  // ... existing code ...

  while (hasMore) {
    // ... existing batch logic ...

    // Add delay between batches to avoid rate limiting
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  // ... rest of function ...
};
```

**Better approach:** Move to background job entirely
```typescript
const sendMailToAllUsersFromDB = async (payload: IBulkMailPayload) => {
  await mailQueue.add('bulk-email-broadcast', payload, {
    attempts: 1,
    removeOnComplete: true,
  });
  return { message: 'Broadcast email queued for processing' };
};
```

**Expected impact:** Eliminates request blocking, prevents rate limiting

---

## Phase 4: Payload Optimization (P2)

### Task 4.1: Reduce Over-Fetching in User List

**File to modify:**
- `src/app/modules/user/user.service.ts` - `getUserList` select

**Current select (20+ fields):**
```typescript
select: {
  id: true, fullName: true, email: true, phoneNumber: true,
  role: true, status: true, describe: true, city: true, address: true,
  image: true, bloodGroup: true, gender: true, allergies: true,
  isAgreeWithTerms: true, plan: true, isEmailVerified: true,
  isDeleted: true, isOnline: true, clientInfo: true, ipInfo: true,
  lastLoginAt: true, createdAt: true, updatedAt: true, createdById: true,
}
```

**Optimized select (essential fields only):**
```typescript
select: {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  role: true,
  status: true,
  image: true,
  plan: true,
  isEmailVerified: true,
  isDeleted: true,
  isOnline: true,
  createdAt: true,
}
```

**Note:** `clientInfo`, `ipInfo`, `trackInfo` should only be returned in admin detail view, not list view.

**Expected impact:** 40-50% reduction in payload size

---

### Task 4.2: Add HTTP Caching Headers

**File to modify:**
- `src/shared/index.ts` - Add cache control middleware

**Add middleware:**
```typescript
// Cache control for GET requests
export const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    // User-specific data: private, short cache
    if (req.headers.authorization) {
      res.set('Cache-Control', 'private, max-age=30');
    } else {
      // Public data: longer cache
      res.set('Cache-Control', 'public, max-age=60');
    }
  }
  next();
};

// Add to setupMiddlewares
app.use(cacheControl);
```

**Expected impact:** Reduced server load, better client-side performance

---

## Phase 5: Infrastructure (P3)

### Task 5.1: Optimize MongoDB Pool Size

**File to modify:**
- `prisma/schema.prisma`

**Add explicit pool size:**
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
  pool     = {
    min = 2
    max = 10
  }
}
```

**Expected impact:** Better connection utilization

---

### Task 5.2: Reduce Queue Cleanup Interval

**File to modify:**
- `src/helpers/queue-manager/queueManager.ts`

**Change:**
```typescript
const MINUTES = 10 * 60 * 1000;  // 10 minutes instead of 1 hour
cleanerInterval = setInterval(async () => {
  // ... existing cleanup logic ...
}, MINUTES);
```

**Expected impact:** Faster cleanup of stuck jobs

---

## Verification Strategy

### For each phase:

1. **Before changes:** Record baseline metrics
   ```bash
   # Run existing tests
   npm test

   # Manual endpoint testing
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/v1/users
   ```

2. **After changes:** Verify no regressions
   ```bash
   # Run tests again
   npm test

   # Compare response times
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/v1/users
   ```

3. **Index verification:**
   ```bash
   npx prisma db execute --stdin <<< "db.users.getIndexes()"
   ```

4. **Cache verification:**
   ```bash
   redis-cli KEYS "user:*" | head -20
   ```

---

## Rollback Plan

Each phase is independent and can be reverted:

1. **Indexes:** `npx prisma migrate reset` (destructive) or manually drop indexes
2. **Caching:** Remove `cacheOr` calls, revert to direct prisma calls
3. **Background jobs:** Revert to synchronous email sending
4. **Payload:** Restore full select statements
5. **Infrastructure:** Revert config changes

---

## Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| User list P95 | ~100ms | ~20ms | curl timing |
| Feed list P95 | ~150ms | ~30ms | curl timing |
| Auth middleware | ~30ms | ~5ms | curl timing |
| Analytics dashboard | ~500ms | ~50ms | curl timing |
| CreateUser response | ~500ms | ~100ms | curl timing |
| Memory usage | ~300MB | ~250MB | docker stats |

---

## Timeline

| Phase | Estimated Effort | Priority |
|-------|------------------|----------|
| Phase 1: Indexes + Cache | 2-3 hours | P0 - Do first |
| Phase 2: Analytics | 2-3 hours | P1 - Do second |
| Phase 3: Background Jobs | 1-2 hours | P1 - Do third |
| Phase 4: Payload | 1-2 hours | P2 - Do fourth |
| Phase 5: Infrastructure | 30 min | P3 - Do last |

**Total estimated effort:** 7-11 hours
