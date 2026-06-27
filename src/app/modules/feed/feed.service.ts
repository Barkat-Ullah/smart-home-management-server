import httpStatus from 'http-status';
import { FeedStatus, NotifyType, Prisma, UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { feedSelect } from './feed.select';
import { buildFilterConditions } from './feed.utils';
import { fileUploader } from '../../utils/fileUploader';
import {
  createBulkNotifications,
  createNotification,
} from '../../utils/notify';
import { handleFileUploads } from '../../utils/handleFile';
import {
  CacheKeys,
  CacheInvalidator,
  TTL,
  cacheOr,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';

// ─────────────────────────────────────────────────────────────────────────────
// Feed-specific cache key builders
// ─────────────────────────────────────────────────────────────────────────────

const FeedCache = {
  single: (id: string) => CacheKeys.single('feed', id),
  list: (params: Record<string, unknown>) => CacheKeys.list('feed', params),
  myList: (userId: string, params: Record<string, unknown>) =>
    CacheKeys.myList('feed', userId, params),

  // Favorites are per-user, lightweight to store separately
  myFavoriteIds: (userId: string) => `feed:favorites:${userId}`,

  // viewCount is updated frequently — keep separate from the full record
  // so we don't bust the full record cache on every view
  viewCount: (id: string) => `feed:viewcount:${id}`,

  // Staff user IDs (admin + moderator) — rarely changes
  staffIds: () => `feed:staff-ids`,

  // Comment list per feed
  comments: (feedId: string, params: Record<string, unknown>) =>
    CacheKeys.list(`feed-comment:${feedId}`, params),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a Set of feedIds that the given user has favorited.
 * Cached for TTL.SHORT (10 min) — fine for eventual consistency on favorites.
 */
async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const key = FeedCache.myFavoriteIds(userId);
  const data = await cacheOr<string[]>(key, TTL.SHORT, async () => {
    const rows = await prisma.feedReaction.findMany({
      where: { userId },
      select: { feedId: true },
    });
    return rows.map(r => r.feedId);
  });
  return new Set(data ?? []);
}

/**
 * Staff IDs (admin + moderator) — cached for 6h because this rarely changes.
 * Used when broadcasting notifications on new feed creation.
 */
async function getStaffIds(): Promise<string[]> {
  const key = FeedCache.staffIds();
  const data = await cacheOr<string[]>(key, TTL.LONG, async () => {
    const rows = await prisma.user.findMany({
      where: {
        role: { in: [UserRoleEnum.ADMIN, UserRoleEnum.MODERATOR] },
        isDeleted: false,
      },
      select: { id: true },
    });
    return rows.map(r => r.id);
  });
  return data ?? [];
}

/**
 * User role check — short-lived cache because users rarely change roles.
 * Cached per userId to avoid repeated lookups in list endpoints.
 */
async function getUserRole(userId: string): Promise<UserRoleEnum | null> {
  const key = `user:role:${userId}`;
  const data = await cacheOr<UserRoleEnum | null>(key, TTL.LONG, async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role ?? null;
  });
  return data ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE FEED
// ─────────────────────────────────────────────────────────────────────────────

const createFeed = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  // Upload files and fetch staff IDs in parallel
  const [uploadedFiles, staffIds] = await Promise.all([
    handleFileUploads(files),
    getStaffIds(),
  ]);

  const result = await prisma.feed.create({
    data: { ...data, files: uploadedFiles.files ?? [], userId },
    select: feedSelect,
  });

  // Invalidate all feed list caches (new record may appear on any page)
  // Run notification + cache invalidation in parallel — don't block response
  await Promise.all([
    CacheInvalidator.onRecordCreate('feed'),
    staffIds.length > 0
      ? createBulkNotifications(
          staffIds.map(staffId => ({
            receiverId: staffId,
            senderId: userId,
            title: 'New Support Feed',
            body: `A new support post has been submitted: "${data.title}"`,
            referenceId: result.id,
            type: NotifyType.Support,
          })),
        )
      : Promise.resolve(),
  ]);

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET FEED LIST (public/admin — all feeds)
// ─────────────────────────────────────────────────────────────────────────────

type IFeedFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
  type?: string;
  priority?: string;
  isDeleted?: string;
  isPinned?: string;
  isLocked?: string;
};

type FeedListResult = {
  meta: { total: number; page: number; limit: number };
  data: any[];
};

const getFeedList = async (
  options: IPaginationOptions,
  filters: IFeedFilterRequest,
  userId: string,
): Promise<FeedListResult> => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  // Cache key encodes all query params so different pages/filters get different keys
  const cacheKey = FeedCache.list({ ...options, ...filters, userId });

  const cached = await cacheOr<FeedListResult>(
    cacheKey,
    TTL.SHORT,
    async () => {
      // Use cached role lookup instead of direct DB hit
      const userRole = await getUserRole(userId);

      const andConditions: Prisma.FeedWhereInput[] = [];

      if (userRole === UserRoleEnum.USER) {
        andConditions.push({ isDeleted: false });
      }

      if (searchTerm) {
        andConditions.push({
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
            {
              createdBy: {
                fullName: { contains: searchTerm, mode: 'insensitive' },
              },
            },
            {
              createdBy: { email: { equals: searchTerm, mode: 'insensitive' } },
            },
          ],
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.FeedWhereInput = andConditions.length
        ? { AND: andConditions }
        : {};

      // Run feed query + count + favorites in parallel
      const [result, total, favoriteIds] = await Promise.all([
        prisma.feed.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            userId: true,
            title: true,
            description: true,
            type: true,
            status: true,
            priority: true,
            tags: true,
            isLocked: true,
            viewCount: true,
            createdAt: true,
            files: true,
            _count: { select: { reactions: true, comments: true } },
            createdBy: {
              select: { id: true, fullName: true, email: true, image: true },
            },
            assignments: {
              where: { isActive: true },
              select: {
                id: true,
                note: true,
                assignedAt: true,
                isActive: true,
                moderator: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    image: true,
                  },
                },
                assignedByUser: {
                  select: { id: true, fullName: true, image: true },
                },
              },
            },
          },
        }),
        prisma.feed.count({ where: whereConditions }),
        getUserFavoriteIds(userId),
      ]);

      const data: any[] = result.map(feed => ({
        ...feed,
        isFavorite: favoriteIds.has(feed.id),
      }));

      return { meta: { total, page, limit }, data };
    },
  );

  return cached ?? { meta: { total: 0, page, limit }, data: [] };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET FEED BY ID (increments viewCount)
// ─────────────────────────────────────────────────────────────────────────────

const getFeedById = async (userId: string, id: string) => {
  // Fetch feed record + user favorites in parallel
  // viewCount is NOT cached inside the record — we increment it async
  const [result, favoriteIds] = await Promise.all([
    cacheOr(FeedCache.single(id), TTL.MEDIUM, () =>
      prisma.feed.findUnique({ where: { id }, select: feedSelect }),
    ),
    getUserFavoriteIds(userId),
  ]);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  // Increment viewCount in background — don't await, doesn't affect response
  prisma.feed
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {
      /* silent — view count is best-effort */
    });

  return { ...result, isFavorite: favoriteIds.has(id) };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY FEED (user-scoped)
// ─────────────────────────────────────────────────────────────────────────────

const getMyFeed = async (
  req: Request,
  options: IPaginationOptions,
  filters: IFeedFilterRequest,
): Promise<FeedListResult> => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = FeedCache.myList(userId, { ...options, ...filters });

  const cached = await cacheOr<FeedListResult>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const andConditions: Prisma.FeedWhereInput[] = [{ userId }];

      if (searchTerm) {
        andConditions.push({
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
            {
              createdBy: {
                fullName: { contains: searchTerm, mode: 'insensitive' },
              },
            },
            {
              createdBy: { email: { equals: searchTerm, mode: 'insensitive' } },
            },
          ],
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.FeedWhereInput = { AND: andConditions };

      const [result, total, favoriteIds] = await Promise.all([
        prisma.feed.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            title: true,
            description: true,
            type: true,
            status: true,
            priority: true,
            tags: true,
            isLocked: true,
            viewCount: true,
            createdAt: true,
            files: true,
            _count: { select: { reactions: true, comments: true } },
            createdBy: {
              select: { id: true, fullName: true, email: true, image: true },
            },
            assignments: {
              where: { isActive: true },
              select: {
                id: true,
                note: true,
                assignedAt: true,
                isActive: true,
                moderator: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    image: true,
                  },
                },
                assignedByUser: {
                  select: { id: true, fullName: true, image: true },
                },
              },
            },
          },
        }),
        prisma.feed.count({ where: whereConditions }),
        getUserFavoriteIds(userId),
      ]);

      const data: any[] = result.map(feed => ({
        ...feed,
        isFavorite: favoriteIds.has(feed.id),
      }));

      return { meta: { total, page, limit }, data };
    },
  );

  return cached ?? { meta: { total: 0, page, limit }, data: [] };
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE FEED
// ─────────────────────────────────────────────────────────────────────────────

const updateFeed = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  // Run file upload & DB fetch in parallel
  const [uploadedFiles, existingFeed] = await Promise.all([
    handleFileUploads(files),
    prisma.feed.findUnique({
      where: { id },
      select: { id: true, userId: true, isLocked: true },
    }),
  ]);

  if (!existingFeed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  if (existingFeed.isLocked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Feed is locked and cannot be edited',
    );
  }

  const result = await prisma.feed.update({
    where: { id },
    data: { ...data, ...uploadedFiles },
    select: feedSelect,
  });

  // Invalidate single record + all lists + owner's personal lists
  await CacheInvalidator.onOwnedRecordUpdate('feed', id, existingFeed.userId);

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE FEED STATUS
// ─────────────────────────────────────────────────────────────────────────────

const changeFeedStatus = async (req: Request) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const changedBy = req.user.id;

  const existingFeed = await prisma.feed.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, title: true },
  });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const fromStatus = existingFeed.status as FeedStatus;
  const toStatus = status as FeedStatus;

  if (fromStatus === toStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Status is already set to this value',
    );
  }

  const extraData: Prisma.FeedUpdateInput = {};
  if (toStatus === 'Resolved') extraData.resolvedAt = new Date();
  if (toStatus === 'Closed') extraData.closedAt = new Date();

  // Transaction: update feed + create history entry atomically
  const [updatedFeed] = await prisma.$transaction([
    prisma.feed.update({
      where: { id },
      data: { status: toStatus, ...extraData },
      select: feedSelect,
    }),
    prisma.feedStatusHistory.create({
      data: { feedId: id, changedBy, fromStatus, toStatus, note },
    }),
  ]);

  // Invalidate cache + send notification in parallel
  await Promise.all([
    CacheInvalidator.onOwnedRecordUpdate('feed', id, existingFeed.userId),
    existingFeed.userId !== changedBy
      ? createNotification({
          receiverId: existingFeed.userId,
          senderId: changedBy,
          title: 'Your Feed Status Changed',
          body: `Your post status changed from "${fromStatus}" to "${toStatus}"${note ? `: ${note}` : ''}`,
          referenceId: id,
          type: NotifyType.FeedStatusChanged,
        })
      : Promise.resolve(),
  ]);

  return updatedFeed;
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE PIN
// ─────────────────────────────────────────────────────────────────────────────

const togglePinFeed = async (id: string) => {
  // Use findUniqueOrThrow to eliminate the manual null check boilerplate
  const existingFeed = await prisma.feed.findUnique({
    where: { id },
    select: { id: true, userId: true, isPinned: true },
  });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const result = await prisma.feed.update({
    where: { id },
    data: { isPinned: !existingFeed.isPinned },
    select: feedSelect,
  });

  await CacheInvalidator.onOwnedRecordUpdate('feed', id, existingFeed.userId);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE LOCK
// ─────────────────────────────────────────────────────────────────────────────

const toggleLockFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({
    where: { id },
    select: { id: true, userId: true, isLocked: true },
  });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const result = await prisma.feed.update({
    where: { id },
    data: { isLocked: !existingFeed.isLocked },
    select: feedSelect,
  });

  await CacheInvalidator.onOwnedRecordUpdate('feed', id, existingFeed.userId);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// ─────────────────────────────────────────────────────────────────────────────

const softDeleteFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({
    where: { id },
    select: { id: true, userId: true, isDeleted: true },
  });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if (existingFeed.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Feed is already deleted');
  }

  const result = await prisma.feed.update({
    where: { id },
    data: { isDeleted: true },
    select: feedSelect,
  });

  await CacheInvalidator.onRecordDelete('feed', id, existingFeed.userId);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HARD DELETE
// ─────────────────────────────────────────────────────────────────────────────

const deleteFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  await prisma.feed.delete({ where: { id } });

  await CacheInvalidator.onRecordDelete('feed', id, existingFeed.userId);
  return { message: 'Feed deleted successfully' };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════════

const assignModerator = async (req: Request) => {
  const { id: feedId } = req.params;
  const { moderatorId, note } = req.body;
  const assignedBy = req.user.id;

  const feed = await prisma.feed.findUnique({
    where: { id: feedId },
    select: { id: true, userId: true, title: true },
  });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  // Deactivate existing assignment + create new one + update feed status atomically
  const [, result] = await prisma.$transaction([
    prisma.feedAssignment.updateMany({
      where: { feedId, moderatorId, isActive: true },
      data: { isActive: false, removedAt: new Date() },
    }),
    prisma.feedAssignment.create({
      data: { feedId, moderatorId, assignedBy, note, isActive: true },
      include: {
        moderator: { select: { id: true, fullName: true, image: true } },
        assignedByUser: { select: { id: true, fullName: true } },
      },
    }),
    prisma.feed.update({
      where: { id: feedId },
      data: { status: 'UnderReview' },
    }),
  ]);

  await Promise.all([
    // Feed record changed (status + assignment) — invalidate
    CacheInvalidator.onOwnedRecordUpdate('feed', feedId, feed.userId),
    createNotification({
      receiverId: moderatorId,
      senderId: assignedBy,
      title: 'Feed Assigned to You',
      body: `You have been assigned to a support feed: "${feed.title}"${note ? ` — ${note}` : ''}`,
      referenceId: feedId,
      type: NotifyType.FeedAssigned,
    }),
  ]);

  return result;
};

const removeModerator = async (req: Request) => {
  const { id: feedId, moderatorId } = req.params;

  const assignment = await prisma.feedAssignment.findFirst({
    where: { feedId, moderatorId, isActive: true },
    select: { id: true, feedId: true },
  });
  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Active assignment not found');
  }

  const result = await prisma.feedAssignment.update({
    where: { id: assignment.id },
    data: { isActive: false, removedAt: new Date() },
  });

  // Feed's assignment list changed — bust record cache and list caches
  await Promise.all([
    invalidateKeys(FeedCache.single(feedId)),
    invalidatePattern(CacheKeys.listPattern('feed')), // feed:list:*
    invalidatePattern(CacheKeys.myListPattern('feed', feedId)), // feed:mylist:*
  ]);
  return result;
};

const getFeedAssignments = async (feedId: string) => {
  return prisma.feedAssignment.findMany({
    where: { feedId },
    orderBy: { assignedAt: 'desc' },
    include: {
      moderator: { select: { id: true, fullName: true, image: true } },
      assignedByUser: { select: { id: true, fullName: true } },
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// REACTION (Toggle Favorite)
// ─────────────────────────────────────────────────────────────────────────────

const createReactionOnFeed = async (userId: string, feedId: string) => {
  const feed = await prisma.feed.findUnique({
    where: { id: feedId },
    select: { id: true, userId: true, title: true },
  });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const existingReaction = await prisma.feedReaction.findFirst({
    where: { userId, feedId },
  });

  // Always invalidate user's favorites cache after toggle
  const favKey = FeedCache.myFavoriteIds(userId);

  if (existingReaction) {
    await prisma.feedReaction.delete({ where: { id: existingReaction.id } });
    await invalidateKeys(favKey);

    return {
      feedId,
      isFavorite: false,
      data: {
        id: existingReaction.id,
        userId: existingReaction.userId,
        feedId: existingReaction.feedId,
        isFavorite: false,
        createdAt: existingReaction.createdAt,
        updatedAt: new Date(),
      },
    };
  }

  const newReaction = await prisma.feedReaction.create({
    data: { userId, feedId, isFavorite: true },
  });
  await invalidateKeys(favKey);

  return { feedId, isFavorite: true, data: newReaction };
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const createComment = async (req: Request) => {
  const { id: feedId } = req.params;
  const { content, parentId } = req.body;
  const userId = req.user.id;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  // Upload files + fetch feed + fetch parent comment all in parallel
  const [uploadResults, feed, parentComment] = await Promise.all([
    // Upload multiple comment attachments concurrently
    files?.files
      ? Promise.all(
          files.files.map(file => {
            const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
            let fileType: 'image' | 'video' | 'pdf' = 'pdf';
            if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext))
              fileType = 'image';
            else if (['mp4', 'mov', 'avi', 'webm'].includes(ext))
              fileType = 'video';
            return fileUploader.uploadToCloudinaryWithType(file, fileType);
          }),
        )
      : Promise.resolve([] as { Location: string }[]),
    prisma.feed.findUnique({
      where: { id: feedId },
      select: {
        id: true,
        userId: true,
        title: true,
        isLocked: true,
        files: true,
      },
    }),
    parentId
      ? prisma.feedComment.findUnique({
          where: { id: parentId },
          select: { id: true, userId: true },
        })
      : Promise.resolve(null),
  ]);

  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if (feed.isLocked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Feed is locked — comments disabled',
    );
  }
  if (parentId && !parentComment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
  }

  const uploaded = uploadResults.map(u => u.Location);

  const result = await prisma.feedComment.create({
    data: {
      feedId,
      userId,
      content,
      parentId: parentId ?? null,
      attachments: uploaded,
    },
    include: {
      author: { select: { id: true, fullName: true, image: true } },
      replies: {
        where: { isDeleted: false },
        include: {
          author: { select: { id: true, fullName: true, image: true } },
        },
      },
    },
  });

  // Invalidate comment list cache for this feed + feed record (comment count changed)
  await Promise.all([
    invalidatePattern(`feed-comment:${feedId}:*`),
    invalidateKeys(FeedCache.single(feedId)),

    // Notifications (fire and forget — don't block response)
    parentId && parentComment && parentComment.userId !== userId
      ? createNotification({
          receiverId: parentComment.userId,
          senderId: userId,
          title: 'New Reply to Your Comment',
          body: `Someone replied to your comment: "${content.slice(0, 80)}"`,
          referenceId: feedId,
          type: NotifyType.FeedReply,
        })
      : !parentId && feed.userId !== userId
        ? createNotification({
            receiverId: feed.userId,
            senderId: userId,
            title: 'New Comment on Your Feed',
            body: `Someone commented on your post "${feed.title}": "${content.slice(0, 80)}"`,
            referenceId: feedId,
            type: NotifyType.FeedComment,
          })
        : Promise.resolve(),
  ]);

  return result;
};

const getFeedComments = async (feedId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const cacheKey = FeedCache.comments(feedId, { page, limit });

  const cached = await cacheOr<{ meta: object; data: object[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const [result, total] = await Promise.all([
        prisma.feedComment.findMany({
          skip,
          take: limit,
          where: { feedId, parentId: null, isDeleted: false },
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, fullName: true, image: true } },
            replies: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'asc' },
              include: {
                author: { select: { id: true, fullName: true, image: true } },
              },
            },
          },
        }),
        prisma.feedComment.count({
          where: { feedId, parentId: null, isDeleted: false },
        }),
      ]);

      return { meta: { total, page, limit }, data: result };
    },
  );

  return (cached ?? { meta: { total: 0, page, limit }, data: [] }) as FeedListResult;
};

const updateComment = async (req: Request) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const comment = await prisma.feedComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, feedId: true },
  });
  if (!comment) throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  if (comment.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only edit your own comments',
    );
  }

  const result = await prisma.feedComment.update({
    where: { id: commentId },
    data: { content, isEdited: true },
    include: { author: { select: { id: true, fullName: true, image: true } } },
  });

  // Bust comment list cache for this feed
  await invalidatePattern(`feed-comment:${comment.feedId}:*`);
  return result;
};

const deleteComment = async (req: Request) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await prisma.feedComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, feedId: true },
  });
  if (!comment) throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  if (comment.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only delete your own comments',
    );
  }

  const result = await prisma.feedComment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  await Promise.all([
    invalidatePattern(`feed-comment:${comment.feedId}:*`),
    invalidateKeys(FeedCache.single(comment.feedId)), // comment count changed
  ]);

  return result;
};

const markCommentAsSolution = async (req: Request) => {
  const { id: feedId, commentId } = req.params;
  const userId = req.user.id;

  const feed = await prisma.feed.findUnique({
    where: { id: feedId },
    select: { id: true, userId: true },
  });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if (feed.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only the feed owner can mark a solution',
    );
  }

  // Unmark existing + mark new in transaction
  const [, result] = await prisma.$transaction([
    prisma.feedComment.updateMany({
      where: { feedId, isSolution: true },
      data: { isSolution: false },
    }),
    prisma.feedComment.update({
      where: { id: commentId },
      data: { isSolution: true },
    }),
  ]);

  await invalidatePattern(`feed-comment:${feedId}:*`);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY
// ─────────────────────────────────────────────────────────────────────────────

const getFeedStatusHistory = async (feedId: string) => {
  // Status history is rarely queried and changes infrequently — cache for 30 min
  return cacheOr(`feed-history:${feedId}`, TTL.MEDIUM, () =>
    prisma.feedStatusHistory.findMany({
      where: { feedId },
      orderBy: { createdAt: 'desc' },
      include: {
        changedByUser: { select: { id: true, fullName: true, image: true } },
      },
    }),
  );
};

export const feedService = {
  // feed
  createFeed,
  getFeedList,
  getFeedById,
  getMyFeed,
  updateFeed,
  softDeleteFeed,
  deleteFeed,
  toggleLockFeed,
  togglePinFeed,
  changeFeedStatus,
  // reaction
  createReactionOnFeed,
  // assignment
  assignModerator,
  removeModerator,
  getFeedAssignments,
  // comments
  createComment,
  getFeedComments,
  updateComment,
  deleteComment,
  markCommentAsSolution,
  // history
  getFeedStatusHistory,
};
