# Performance Audit Report

**Date:** 2026-07-13
**Codebase:** smart-home-management-server (Node.js/Express/MongoDB/Redis)
**Scope:** Full-stack performance analysis

---

## Executive Summary

The codebase has a **well-designed caching layer** (Redis with stampede protection, negative caching, avalanche protection) but suffers from **database query inefficiencies**, **missing caching on hot paths**, **in-memory data processing that should use aggregation pipelines**, and **blocking background operations** that impact request latency.

**Estimated overall improvement potential:** 40-60% reduction in P95 response times for critical endpoints.

---

## [S1] Database Layer Issues

### [S1.1] N+1 Query Patterns

**Location:** `src/app/modules/user/analytics/analytics.service.ts:4-43`

**Problem:** `getUserLogoutStats()` fetches ALL logout records, extracts unique user IDs, then fetches users by ID array. For large datasets, this loads everything into memory.

```
1. prisma.logout.findMany() → loads all logouts
2. [...new Set(logouts.map(l => l.userId))] → extracts unique IDs
3. prisma.user.findMany({ where: { id: { in: userIds } } }) → fetches users
4. Manual grouping in JavaScript
```

**Impact:** O(n) memory usage, 2 DB round trips, no index utilization for the aggregation
**Estimated cost:** 50-200ms for 10K logout records

---

### [S1.2] In-Memory Aggregation Instead of Database Aggregation

**Location:** `src/app/modules/user/analytics/analytics.service.ts:46-65, 68-115`

**Problem:** `getLogoutTrend()` and `getAdminDashboardStats()` perform aggregation in JavaScript instead of using MongoDB's aggregation pipeline.

**`getLogoutTrend` issue:**
- Fetches ALL logouts for a year
- Groups by month in JavaScript
- Should use `$group` with `$month` operator

**`getAdminDashboardStats` issue:**
- Runs 5 separate `count()` queries
- Fetches ALL users from last 6 months
- Groups by month in JavaScript
- Should use single aggregation with `$group` and `$match`

**Impact:** 5+ DB round trips, full table scans, O(n) memory
**Estimated cost:** 100-500ms depending on data volume

---

### [S1.3] Missing Database Indexes

**Location:** Multiple Prisma schema files

**Missing indexes identified:**

| Model | Missing Index | Query Pattern | Impact |
|-------|---------------|---------------|--------|
| User | `[email]` | Auth lookup, `findUnique({ where: { email } })` | HIGH - auth is hot path |
| User | `[status, createdAt]` | Admin dashboard filtered queries | MEDIUM |
| Feed | `[userId, createdAt]` | `getMyFeed()` filtered by userId | HIGH |
| Feed | `[status, isDeleted, createdAt]` | `getFeedList()` filtered queries | HIGH |
| Logout | `[userId]` | Auth session check (`findFirst`) | HIGH - every request |
| UserSubscription | `[userId, createdAt]` | `getMyPlan()`, `getUserSubscriptionList()` | MEDIUM |
| Meal | `[userId, isDeleted, createdAt]` | `getMyMeals()` | MEDIUM |
| WeeklyMealPlan | `[userId, isDeleted, startDate]` | `getMyWeeklyMealPlans()` | MEDIUM |

**Note:** The User model already has `[role, status, isDeleted]`, `[createdById]`, `[plan, isDeleted]`, `[createdAt(sort: Desc)]` indexes. The Logout model has `[userId, logoutAt(sort: Desc)]`.

**Impact:** Full collection scans on filtered queries
**Estimated cost:** 10-100ms per query without proper indexes

---

### [S1.4] Vector Search Without Index

**Location:** `src/app/cv/rag.service.ts:15-39`

**Problem:** `findRelevantChunks()` loads ALL CV chunks into memory and computes cosine similarity in JavaScript.

```typescript
const allChunks = await prisma.cvChunk.findMany({
  select: { content: true, embedding: true },
});
// Then: scored = allChunks.map(chunk => ({
//   content: chunk.content,
//   score: cosineSimilarity(queryEmbedding, chunk.embedding),
// }));
```

**Impact:** O(n) memory and CPU for every RAG query. No vector index.
**Estimated cost:** 50-500ms depending on chunk count
**Risk:** High memory usage with large CVs

---

### [S1.5] Over-Fetching in List Queries

**Location:** `src/app/modules/user/user.service.ts:167-288`

**Problem:** `getUserList()` returns 20+ fields including large JSON fields (`clientInfo`, `ipInfo`, `trackInfo`). Most list views don't need all these fields.

**Impact:** Increased payload size, serialization overhead, network transfer time
**Estimated cost:** 5-20ms per request for serialization + network

---

### [S1.6] Sequential DB Queries in Auth Middleware

**Location:** `src/app/middlewares/auth.ts:48-75`

**Problem:** Auth middleware runs two sequential queries:
1. `prisma.logout.findFirst()` - find last logout
2. `prisma.user.findUnique()` - get user session

These are cached, but the cache key is per-user, and cache invalidation on logout means the first request after logout hits DB.

**Impact:** 10-30ms on cache miss (first request after login/logout)
**Mitigation:** Already cached for 10 minutes - acceptable

---

## [S2] Caching Layer Issues

### [S2.1] Missing Cache Coverage on Hot Paths

**Location:** Multiple service files

**Uncached endpoints that should be cached:**

| Endpoint | Service | Current | Recommendation |
|----------|---------|---------|----------------|
| `getUserById` | `user.service.ts:293` | No cache | Add `cacheOr` with TTL.MEDIUM |
| `getMyUser` | `user.service.ts:307` | No cache | Add `cacheOr` with TTL.SHORT |
| `getMyCareGiver` | `user.service.ts:97` | No cache | Add `cacheOr` with TTL.SHORT |
| `getSubscriptionById` | `subscription.service.ts:304` | No cache | Add `cacheOr` with TTL.LONG |
| `getMyPlan` | `subscription.service.ts:377` | No cache | Add `cacheOr` with TTL.SHORT |
| `getWeeklyMealPlanList` | `weeklyMealPlan.service.ts:91` | No cache | Add `cacheOr` with TTL.SHORT |
| `getMyWeeklyMealPlans` | `weeklyMealPlan.service.ts:125` | No cache | Add `cacheOr` with TTL.SHORT |
| `getWeeklyMealPlanById` | `weeklyMealPlan.service.ts:164` | No cache | Add `cacheOr` with TTL.MEDIUM |

**Impact:** Every request hits database for these endpoints
**Estimated cost:** 10-50ms per request

---

### [S2.2] Cache Invalidation Overhead

**Location:** `src/lib/redis.ts:234-263`

**Problem:** `invalidatePattern()` uses SCAN with COUNT 200, which can be slow for large key spaces. On `onRecordCreate`, ALL list caches for a model are invalidated.

```typescript
onRecordCreate: (model: string) => invalidateModelLists(model),
// → invalidatePattern(`${model}:list:*`)
// → SCAN + DEL in batches
```

**Impact:** 10-100ms on write operations for models with many cached lists
**Mitigation:** Already uses SCAN (not KEYS) and batched DEL - acceptable for current scale

---

### [S2.3] Cache Key Collision Risk

**Location:** `src/lib/redis.ts:458-480`

**Problem:** `stableHash()` uses djb2 variant hash which produces 32-bit integers. With base-36 encoding, collision probability increases with cache volume.

**Impact:** Low - djb2 is collision-resistant enough for cache keys
**Risk:** Theoretical only at current scale

---

## [S3] Application Layer Issues

### [S3.1] Blocking Background Operations in Request Path

**Location:** `src/app/modules/user/user.service.ts:43-91`

**Problem:** `createUser()` performs 4 sequential operations:
1. Check existing user (DB)
2. Create user (DB)
3. Fetch creator info (DB) - for email template
4. Send welcome email (network I/O)

Steps 3-4 should be background jobs, not blocking the response.

**Impact:** 200-500ms added to create user response time
**Estimated cost:** Email sending is the bottleneck (50-200ms)

---

### [S3.2] Email Sending Without Rate Limiting

**Location:** `src/app/modules/user/user.service.ts:492-545`

**Problem:** `sendMailToAllUsersFromDB()` sends emails in batches of 200 with `Promise.allSettled`. No rate limiting between batches. Could hit SendGrid/Brevo rate limits.

**Impact:** API throttling, failed sends, potential account suspension
**Risk:** HIGH in production with many users

---

### [S3.3] Redundant Existence Checks

**Location:** Multiple service files

**Pattern:** Many update/delete operations fetch the record twice:
1. `findUnique()` to check existence
2. `update()` or `delete()`

This is 2 DB round trips when 1 would suffice (use `update` and catch `RecordNotFound`).

**Affected endpoints:**
- `updateUser` (user.service.ts:338)
- `toggleStatusUser` (user.service.ts:369)
- `softDeleteUser` (user.service.ts:389)
- `deleteUser` (user.service.ts:411)
- `updateMeal` (meal.service.ts:167)
- `deleteMeal` (meal.service.ts:197)
- `updateWeeklyMealPlan` (weeklyMealPlan.service.ts:209)
- `deleteWeeklyMealPlan` (weeklyMealPlan.service.ts:237)

**Impact:** 5-15ms per operation (extra DB round trip)
**Risk:** Low - but widespread pattern

---

### [S3.4] Large Payload Serialization

**Location:** `src/app/modules/feed/feed.service.ts:170-280`

**Problem:** `getFeedList()` returns deeply nested objects with:
- Feed data (15+ fields)
- `_count` for reactions and comments
- `createdBy` user object (4 fields)
- `assignments` array with nested `moderator` and `assignedByUser` objects

For 20 items per page, this can be 50-100KB of JSON.

**Impact:** Serialization time, network transfer, client parsing time
**Estimated cost:** 10-30ms for serialization

---

## [S4] Queue & Background Processing

### [S4.1] Queue Cleanup Interval Too Long

**Location:** `src/helpers/queue-manager/queueManager.ts:22-31`

**Problem:** OTP queue cleanup runs every hour (`HOUR = 60 * 60 * 1000`). Failed/stuck jobs accumulate for up to an hour.

**Impact:** Memory usage in Redis, potential job duplication
**Recommendation:** Reduce to 10-15 minutes

---

### [S4.2] Worker Resource Constraints

**Location:** `docker-compose.yml:38-64`

**Problem:** Worker container limited to 0.5 CPU and 512M memory. Email sending jobs may queue up during traffic spikes.

**Impact:** Job processing delays, queue buildup
**Recommendation:** Increase to 1.0 CPU for worker

---

## [S5] API Performance

### [S5.1] No HTTP Caching Headers

**Location:** `src/shared/index.ts`

**Problem:** No `Cache-Control` or `ETag` headers on GET responses. Every request hits the server even for unchanged data.

**Impact:** Unnecessary network round trips, server load
**Recommendation:** Add `Cache-Control: private, max-age=60` for user-specific data

---

### [S5.2] Rate Limiter Too Generous

**Location:** `src/shared/index.ts:57-74`

**Problem:** Rate limit is 2000 requests per 15 minutes (2.2 req/sec). This is very generous and may not protect against abuse.

**Impact:** Potential abuse, server overload under attack
**Risk:** LOW for internal use, MEDIUM for public API

---

## [S6] Infrastructure

### [S6.1] MongoDB Connection Pool

**Location:** `src/app/utils/prisma.ts`

**Problem:** Prisma uses default connection pool size (num_physical_cpus * 2 + 1). No explicit `pool_size` configuration.

**Impact:** May be suboptimal for the container's 0.5 CPU limit
**Recommendation:** Set `pool_size = 10` explicitly in Prisma datasource

---

### [S6.2] Redis Connection Configuration

**Location:** `src/lib/redis.ts:7-27`

**Problem:** `lazyConnect: true` means Redis connects on first command, not at startup. First request may have connection overhead.

**Impact:** 10-50ms on first request after deployment
**Mitigation:** Acceptable for most cases

---

## Priority Matrix

| Priority | Issue | Impact | Risk | Effort | ROI |
|----------|-------|--------|------|--------|-----|
| **P0** | Missing indexes (S1.3) | HIGH | LOW | LOW | VERY HIGH |
| **P0** | Missing cache coverage (S2.1) | HIGH | LOW | LOW | VERY HIGH |
| **P1** | In-memory aggregation (S1.2) | HIGH | MEDIUM | MEDIUM | HIGH |
| **P1** | Background email sending (S3.1) | MEDIUM | LOW | LOW | HIGH |
| **P1** | Vector search optimization (S1.4) | MEDIUM | MEDIUM | MEDIUM | HIGH |
| **P2** | Over-fetching (S1.5) | MEDIUM | LOW | LOW | MEDIUM |
| **P2** | Redundant existence checks (S3.3) | LOW | LOW | LOW | MEDIUM |
| **P2** | HTTP caching headers (S5.1) | MEDIUM | LOW | LOW | MEDIUM |
| **P3** | Queue cleanup interval (S4.1) | LOW | LOW | LOW | LOW |
| **P3** | Worker resources (S4.2) | LOW | LOW | LOW | LOW |
| **P3** | Rate limiter tuning (S5.2) | LOW | MEDIUM | LOW | LOW |
| **P3** | MongoDB pool size (S6.1) | LOW | LOW | LOW | LOW |

---

## Expected Performance Gains

| Optimization | Before (P95) | After (P95) | Improvement |
|--------------|--------------|-------------|-------------|
| Add missing indexes | 50-100ms | 5-20ms | 70-80% |
| Add cache coverage | 30-80ms | 2-10ms | 80-90% |
| Aggregation pipeline | 100-500ms | 10-50ms | 80-90% |
| Background emails | 200-500ms | 20-50ms | 75-90% |
| Vector search index | 50-500ms | 5-20ms | 80-90% |
| Reduce payload size | 10-30ms | 5-15ms | 40-50% |

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Adding indexes | LOW | MongoDB supports online index creation |
| Adding caching | LOW | Cache invalidation already implemented |
| Aggregation pipeline | MEDIUM | Test with existing data, fall back to JS |
| Background emails | LOW | Use existing BullMQ infrastructure |
| Vector search | MEDIUM | May require MongoDB Atlas or plugin |
| Reducing payload | LOW | Frontend may need updates |

---

## Appendix: File Locations

| Issue | File | Lines |
|-------|------|-------|
| S1.1 | `src/app/modules/user/analytics/analytics.service.ts` | 4-43 |
| S1.2 | `src/app/modules/user/analytics/analytics.service.ts` | 46-115 |
| S1.3 | `prisma/user.prisma` | 91-95 |
| S1.4 | `src/app/cv/rag.service.ts` | 15-39 |
| S1.5 | `src/app/modules/user/user.service.ts` | 167-288 |
| S2.1 | `src/app/modules/user/user.service.ts` | 293-333 |
| S3.1 | `src/app/modules/user/user.service.ts` | 43-91 |
| S3.2 | `src/app/modules/user/user.service.ts` | 492-545 |
| S3.3 | Multiple service files | Various |
| S4.1 | `src/helpers/queue-manager/queueManager.ts` | 22-31 |
| S5.1 | `src/shared/index.ts` | 27-54 |
