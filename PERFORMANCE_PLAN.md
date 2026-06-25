# Smart Home Management Server — Performance Optimization Plan

**Plan Date:** 2026-06-25  
**Based On:** [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md)  
**Strategy:** High impact / low risk first, then high impact / medium risk, then everything else

---

## Execution Strategy Overview

### Phases
1. **Phase 1 (Days 1-2):** Critical & High Impact / Low Risk — Immediate wins
2. **Phase 2 (Days 3-4):** High Impact / Medium Risk — Architectural improvements
3. **Phase 3 (Days 5-7):** Medium Impact — Optimizations and hardening
4. **Phase 4 (Days 8-10):** Low Impact — Polish and monitoring

### Guiding Principles
- ✅ Preserve all existing functionality
- ✅ No breaking changes unless absolutely necessary
- ✅ Maintain readability and maintainability
- ✅ Follow existing project conventions
- ✅ No premature optimization
- ✅ Every change includes before/after analysis

---

## Phase 1: Critical & High Impact / Low Risk (Days 1-2)

### P1.1 🚨 MongoDB Indexes — All Models
**Est. Time:** 1 day  
**Risk:** Low  
**ROI:** ★★★★★

**What:**
Add comprehensive indexes to all Prisma schema files targeting the most common query patterns.

**Files to modify:**
- `prisma/user.prisma` — Add indexes for email, role, status, isDeleted, createdAt, plan
- `prisma/event.prisma` — Add indexes for userId, eventDate, status, isDeleted
- `prisma/notification.prisma` — Add indexes for receiverId, isRead, createdAt
- `prisma/children.prisma` — Add indexes for userId, isDeleted
- `prisma/family.prisma` — Add indexes for userId, isDeleted
- `prisma/feed.prisma` — Add indexes for userId, status, type, createdAt
- `prisma/financial.prisma` — Add indexes for userId, date, type, financialProfileId
- `prisma/medicine.prisma` — Add indexes for userId, scheduleId, status, startDate, scheduledAt
- `prisma/memory.prisma` — Add indexes for userId, memoryOf, relatedPersonId
- `prisma/houseroom.prisma` — Add indexes for userId, houseroomId
- `prisma/subscription.prisma` — Add indexes for userId, subscriptionId
- `prisma/message.prisma`, `prisma/follow.prisma`, `prisma/favourite.prisma`, `prisma/inventory.prisma`, `prisma/cv.prisma`, `prisma/payment.prisma`

**Expected Impact:**
- **Response Time:** 10-100× improvement on filtered queries
- **Database Load:** 80% reduction in collection scans
- **Infrastructure Cost:** Lower MongoDB Atlas read units

---

### P1.2 🚨 Eliminate Dual PrismaClient Instances
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
Merge `prisma` and `insecurePrisma` into a single PrismaClient instance. Create a utility wrapper that selectively omits fields where needed, rather than maintaining two connection pools.

**Files to modify:**
- `src/app/utils/prisma.ts` — Refactor to single instance with selective omit logic

**Files affected (import changes):**
- `src/app/middlewares/auth.ts` — Replace `insecurePrisma` usage with single `prisma` instance
- `src/shared/index.ts` — Replace `insecurePrisma` in `serverHealth`

**Expected Impact:**
- **Memory:** -40MB (eliminate duplicate connection pool)
- **Connections:** -50% (half the MongoDB connections)
- **Response Time:** -20ms per query (no additional pool overhead)

---

### P1.3 🚨 Implement Redis Caching Layer
**Est. Time:** 1 day  
**Risk:** Medium  
**ROI:** ★★★★★

**What:**
Replace the Redis stub file with a full Redis caching implementation using `ioredis`. Implement:

1. **Query Result Caching:**
   - Cache frequently accessed data (articles, subscriptions, user preferences)
   - TTL-based invalidation (5-15 minutes for read-heavy data)
   - Cache-aside pattern

2. **Rate Limiter Backend:**
   - Move from memory-based rate limiting to Redis-backed
   - More reliable across multiple instances

3. **Session Management:**
   - Cache active session tokens
   - Quick logout invalidation

**Files to create/modify:**
- `src/lib/redis.ts` — Full Redis client implementation
- `src/lib/cache.ts` — Cache utility (get, set, del, remember)
- Update relevant services to use cache

**Expected Impact:**
- **Response Time:** -90% for cached queries (from ~100ms to ~5ms)
- **Database Load:** 80-90% reduction in reads
- **Infrastructure Cost:** Substantial savings on MongoDB Atlas read units

---

### P1.4 🚨 Implement Background Job Queue for Emails & Notifications
**Est. Time:** 1.5 days  
**Risk:** Medium  
**ROI:** ★★★★★

**What:**
Implement a proper queue system using BullMQ (already in package.json) with Redis as the backend. 

**Queue Definitions:**
- `email-queue` — For all email sending (OTP, welcome, notifications)
- `notification-queue` — For FCM push notifications
- `batch-operations-queue` — For mass operations (logout all users, bulk email)

**Files to create:**
- `src/lib/queue.ts` — Queue connection and factory
- `src/workers/email.worker.ts` — Email worker
- `src/workers/notification.worker.ts` — Notification worker
- `src/workers/batch.worker.ts` — Batch operations worker

**Files to modify:**
- `src/app/modules/auth/auth.service.ts` — Queue email instead of direct send
- `src/app/modules/notifications/notification.service.ts` — Queue notifications
- `src/app/modules/user/user.service.ts` — Queue bulk mail operations
- `src/server.ts` — Start workers

**Expected Impact:**
- **Response Time:** -80% on email/notification endpoints (from 2s to ~200ms)
- **Reliability:** Failed jobs auto-retry (up to 3 attempts)
- **Throughput:** Background processing doesn't block API responses

---

## Phase 2: High Impact / Medium Risk (Days 3-4)

### P2.1 🔴 Paginate Unbounded Queries
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
Add pagination/chunking to all queries that currently fetch all records without limits.

**Files to modify:**
- `src/app/modules/user/user.service.ts`:
  - `sendMailToAllUsersFromDB` — Process in chunks of 100
  - `sendMailToSelectedUsersFromDB` — Validate with paginated lookup
- `src/app/modules/notifications/notification.service.ts`:
  - `sendNotifications` — Process in batches
- `src/app/modules/user/analytics/analytics.service.ts`:
  - `getUserLogoutStats` — Add limit/page with fallback
  - `getLogoutTrend` — Use aggregation instead of fetching all

**Expected Impact:**
- **Memory:** -99% on batch operations
- **Reliability:** No more request timeouts on large datasets
- **Scalability:** Works with 100K+ users

---

### P2.2 🔴 Parallelize File Uploads
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
Convert sequential file uploads to parallel using `Promise.all`.

**Files to modify:**
- `src/shared/index.ts` — `documentUpload` function

**Pattern:**
```typescript
// Before (sequential):
if (files?.image?.[0]) { await uploadOne('image'); }
if (files?.video?.[0]) { await uploadOne('video'); }

// After (parallel):
const uploads = [];
if (files?.image?.[0]) uploads.push(uploadOne('image'));
if (files?.video?.[0]) uploads.push(uploadOne('video'));
await Promise.all(uploads);
```

**Expected Impact:**
- **Upload Speed:** 2-3× faster for multi-file uploads
- **User Experience:** Significantly reduced wait time

---

### P2.3 🔴 Add SSE Heartbeat & Connection Cleanup
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
Add heartbeat mechanism to SSE connections and proper timeout/cleanup.

**Files to modify:**
- `src/app/utils/sse.ts` — Add heartbeat interval and connection timeout
- `src/app/modules/notifications/notification.service.ts` — Add periodic pings

**Expected Impact:**
- **Memory:** Fixes potential memory leak from dead connections
- **Scalability:** Can handle 10× more concurrent connections

---

### P2.4 🟡 Refactor JSON Field Filtering
**Est. Time:** 1 day  
**Risk:** Medium  
**ROI:** ★★★★☆

**What:**
Refactor the `clientInfo` and `ipInfo` filtering to avoid `string_contains` on JSON fields.

**Solution Options:**
1. Store flattened indexed fields at the top level of User model (device, browser, os, country, region, city, timezone, isp)
2. Or, accept the limitation and note it's a known MongoDB/Prisma constraint

**Files to modify:**
- `prisma/user.prisma` — Add top-level indexed fields for queryable properties
- `src/app/modules/user/user.service.ts` — Update filter logic
- Seed/migration script to backfill data

**Expected Impact:**
- **Query Speed:** 100× improvement on user filtering by client/ip info
- **Scalability:** Enables efficient filtering at 100K+ users

---

### P2.5 🔴 Docker Resource Limits & Build Optimization
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
1. Add memory/CPU limits to all Docker services
2. Optimize Docker build cache layers
3. Add health check dependencies for worker

**Files to modify:**
- `docker-compose.yml` — Add `deploy.resources.limits`
- `Dockerfile` — Optimize layer caching (copy prisma only once)

**Expected Impact:**
- **Stability:** Prevents cascading failures from memory leaks
- **Build Time:** -30% faster builds
- **Cost Control:** Predictable resource usage

---

## Phase 3: Medium Impact Optimizations (Days 5-7)

### P3.1 🟡 Add HTTP Response Caching (ETag)
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★★☆

**What:**
Add ETag middleware for GET endpoints that return static or semi-static data.

**Files to modify:**
- `src/shared/index.ts` — Add ETag configuration to `setupMiddlewares`

**Expected Impact:**
- **Response Time:** -60% on cached GET requests (304 Not Modified)
- **Bandwidth:** Reduced payload transfer for unmodified resources

---

### P3.2 🟡 Add Compression Awareness
**Est. Time:** 0.25 day  
**Risk:** Low  
**ROI:** ★★★☆☆

**What:**
Configure compression middleware to filter by content type, skipping already-compressed assets.

**Files to modify:**
- `src/shared/index.ts` — Configure compression options

**Expected Impact:**
- **CPU:** Reduced compression overhead for binary/resized assets

---

### P3.3 🟡 Optimize Analytics Aggregation Queries
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★☆☆

**What:**
Replace in-memory analytics processing with MongoDB aggregation pipeline using Prisma raw queries or aggregation support.

**Files to modify:**
- `src/app/modules/user/analytics/analytics.service.ts`
- Add `src/app/modules/user/analytics/analytics.queries.ts`

**Expected Impact:**
- **Memory:** O(1) instead of O(n) for analytics
- **Response Time:** 10-100× faster on large datasets
- **Database Load:** Less data transferred to application

---

### P3.4 🟡 Rate Limiter — Use Redis + User ID Keys
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★☆☆

**What:**
Update rate limiter to use Redis backend with user ID as the key (when authenticated) and IP as fallback.

**Files to modify:**
- `src/shared/index.ts` — Update `apiLimiter` configuration
- `src/lib/redis.ts` — Already created in P1.3

**Expected Impact:**
- **Reliability:** Consistent rate limiting across multiple server instances
- **Accuracy:** Better proxy/CDN handling

---

### P3.5 🟡 Optimize Prisma Query Patterns
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★★☆☆

**What:**
Batch `findUnique` + `update` patterns into single `update` with `where` clauses where possible. Use `updateMany` for bulk operations.

**Files to modify:**
- All service files with findUnique + update pattern:
  - `event.service.ts` — updateEvent, toggleStatusEvent
  - `user.service.ts` — updateUser, softDeleteUser, toggleStatusUser
  - `auth.service.ts` — Multiple patterns

**Expected Impact:**
- **Database Queries:** -50% on update operations
- **Response Time:** -20ms per eliminated query

---

### P3.6 🟡 Fix SSE Utility Implementation
**Est. Time:** 0.25 day  
**Risk:** Low  
**ROI:** ★★★☆☆

**What:**
Read and optimize the SSE utility file (`src/app/utils/sse.ts`) for proper cleanup and heartbeat support.

**Files to modify:**
- `src/app/utils/sse.ts` — Implement heartbeat and cleanup

**Expected Impact:**
- **Stability:** Proper connection lifecycle management

---

## Phase 4: Low Impact / Polish (Days 8-10)

### P4.1 🟢 Remove Console.log in Error Handler
**Est. Time:** 0.1 day  
**Risk:** None  
**ROI:** ★★☆☆☆

**What:**
Replace `console.log(err)` with structured winston logger.

**Files to modify:**
- `src/app/middlewares/globalErrorHandler.ts`

**Expected Impact:** Minimal — logging consistency

### P4.2 🟢 Consistent Bcrypt Salt Rounds
**Est. Time:** 0.1 day  
**Risk:** None  
**ROI:** ★★☆☆☆

**What:**
Standardize bcrypt salt rounds to 12 across all auth operations.

**Files to modify:**
- `src/app/modules/auth/auth.service.ts` — Change line 450 from 10 to 12

**Expected Impact:** Minimal — code consistency

### P4.3 🟢 Optimize Health Check
**Est. Time:** 0.1 day  
**Risk:** None  
**ROI:** ★★☆☆☆

**What:**
Remove `$connect()` from health check endpoint — Prisma auto-connects on first query.

**Files to modify:**
- `src/shared/index.ts` — Simplify `serverHealth`

**Expected Impact:** Minimal — one less unnecessary operation per health check

### P4.4 🟢 API Response Payload Optimization
**Est. Time:** 0.5 day  
**Risk:** Low  
**ROI:** ★★☆☆☆

**What:**
Review and reduce default field selections in list endpoints to return only essential fields. Add documentation on field selection via query params.

**Files to modify:**
- All service files with list endpoints

**Expected Impact:** 30-50% smaller response payloads

---

## Resource Allocation

| Phase | Days | Engineer Focus | Estimated Impact |
|-------|------|----------------|------------------|
| Phase 1 | 2 | Database + Caching + Queues | 70% of total performance gain |
| Phase 2 | 2 | Application layer + Infrastructure | 20% of total performance gain |
| Phase 3 | 3 | Optimization + Monitoring | 8% of total performance gain |
| Phase 4 | 3 | Polish + Consistency | 2% of total performance gain |

**Total Estimated Time:** 10 days for full implementation  
**Critical Path (Phase 1 only):** 2 days for 70% of the benefit

---

## Expected End-State Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API P50 Response Time | ~500ms | ~80ms | 6× faster |
| API P99 Response Time | ~3000ms | ~500ms | 6× faster |
| MongoDB Connections | 20 (2 pools) | 10 (1 pool) | 50% reduction |
| Memory Usage (App) | ~200MB | ~120MB | 40% reduction |
| Database Read Units | Baseline | -80% | Significant cost savings |
| Email Delivery Time | Synchronous (~2s) | Background (~5s async) | 40× faster API |
| File Upload Speed | 3s (3 files sequential) | 1.5s (parallel) | 2× faster |
| Concurrent SSE Connections | ~100 (no cleanup) | ~1000+ (heartbeat) | 10× scale |
| Batch Operations Scale | ~1000 users | ~100,000+ users | 100× scale |

---

## Risk Register

| # | Risk | Mitigation | Phase |
|---|------|------------|-------|
| R1 | Migration downtime for indexes | Create indexes in background on MongoDB Atlas | P1.1 |
| R2 | Redis connection failure causing errors | Circuit breaker pattern, fallback to direct DB | P1.3 |
| R3 | Queue job failures losing messages | Implement dead letter queue + retry | P1.4 |
| R4 | JSON field refactoring breaks existing queries | Maintain backward compatibility layer | P2.4 |
| R5 | SSE heartbeat changes break connected clients | Test with existing frontend connections | P2.3 |

---

## Rollback Plan

For each change:
1. **Indexes:** Drop newly created indexes
2. **PrismaClient:** Restore original prisma.ts file
3. **Redis:** Disable caching by setting `REDIS_ENABLED=false` in .env
4. **Queue:** Disable workers and fall back to synchronous operations via feature flag
5. **All changes:** Use git for atomic commits with descriptive messages

---

## Success Criteria

- [ ] All Phase 1 items completed and verified
- [ ] P50 API response time under 100ms on production load test
- [ ] P99 API response time under 500ms on production load test
- [ ] MongoDB CPU utilization reduced by 60%+
- [ ] Zero request failures due to timeout in batch operations
- [ ] Email delivery reliability: 99.9% (with queue retries)
- [ ] All existing tests pass (or updated)

---

## Next Steps

1. ✅ **Review and approve this plan** — Present to team/stakeholders
2. ✅ **Set up performance baseline** — Run load tests before changes
3. 🚀 **Begin Phase 1 execution** — Start with P1.1 (indexes) and P1.2 (PrismaClient)
4. 📊 **Re-measure after each phase** — Validate improvements
5. 🔄 **Iterate** — Continue based on results