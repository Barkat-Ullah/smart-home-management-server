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

// -------------------------------------------------------
// create Feed
// -------------------------------------------------------
const createFeed = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploaded: string[] = [];

  if (files?.files) {
    for (const file of files.files) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      let fileType: 'image' | 'video' | 'pdf' = 'pdf';

      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || ''))
        fileType = 'image';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || ''))
        fileType = 'video';

      const upload = await fileUploader.uploadToCloudinaryWithType(
        file,
        fileType,
      );

      uploaded.push(upload.Location);
    }
  }

  const addedData = {
    ...data,
    files: uploaded,
    userId,
  };

  const result = await prisma.feed.create({
    data: addedData,
    select: feedSelect,
  });

  // notify all admins and moderators
  const staffUsers = await prisma.user.findMany({
    where: {
      role: { in: [UserRoleEnum.ADMIN, UserRoleEnum.MODERATOR] },
      isDeleted: false,
    },
    select: { id: true },
  });

  if (staffUsers.length > 0) {
    await createBulkNotifications(
      staffUsers.map(staff => ({
        receiverId: staff.id,
        senderId: userId,
        title: 'New Support Feed',
        body: `A new support post has been submitted: "${data.title}"`,
        referenceId: result.id,
        type: NotifyType.Support,
      })),
    );
  }

  return result;
};

// -------------------------------------------------------
// get all Feed
// -------------------------------------------------------
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

const getFeedList = async (
  options: IPaginationOptions,
  filters: IFeedFilterRequest,
  userId: string,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  const andConditions: Prisma.FeedWhereInput[] = [];

  if (user?.role === UserRoleEnum.USER) {
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
          createdBy: {
            email: { equals: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.FeedWhereInput = { AND: andConditions };

  const favoriteFeed = await prisma.feedReaction.findMany({
    where: {
      userId,
    },
    select: {
      feedId: true,
    },
  });

  const favorFeedIds = new Set(favoriteFeed.map(f => f.feedId));

  const result = await prisma.feed.findMany({
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
      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
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
            select: { id: true, fullName: true, email: true, image: true },
          },
          assignedByUser: {
            select: { id: true, fullName: true, image: true },
          },
        },
      },
    },
  });

  const formatted = result.map(feed => ({
    ...feed,
    isFavorite: favorFeedIds.has(feed.id),
  }));

  const total = await prisma.feed.count({ where: whereConditions });
  return { meta: { total, page, limit }, data: formatted };
};

// -------------------------------------------------------
// get Feed by id (increments viewCount)
// -------------------------------------------------------
const getFeedById = async (userId: string, id: string) => {
  const result = await prisma.feed.findUnique({
    where: { id },
    select: feedSelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  const favoriteFeed = await prisma.feedReaction.findMany({
    where: {
      userId,
    },
    select: {
      feedId: true,
    },
  });

  const favorFeedIds = new Set(favoriteFeed.map(f => f.feedId));

  // increment view count
  await prisma.feed.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...result,
    isFavorite: favorFeedIds.has(result.id),
  };
};

// -------------------------------------------------------
// get my Feed
// -------------------------------------------------------
const getMyFeed = async (
  req: Request,
  options: IPaginationOptions,
  filters: IFeedFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

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
          createdBy: {
            email: { equals: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const favoriteFeed = await prisma.feedReaction.findMany({
    where: {
      userId,
    },
    select: {
      feedId: true,
    },
  });

  const favorFeedIds = new Set(favoriteFeed.map(f => f.feedId));

  const whereConditions: Prisma.FeedWhereInput = { AND: andConditions };

  const result = await prisma.feed.findMany({
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
      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
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
            select: { id: true, fullName: true, email: true, image: true },
          },
          assignedByUser: {
            select: { id: true, fullName: true, image: true },
          },
        },
      },
    },
  });

  const formatted = result.map(feed => ({
    ...feed,
    isFavorite: favorFeedIds.has(feed.id),
  }));

  const total = await prisma.feed.count({ where: whereConditions });
  return { meta: { total, page, limit }, data: formatted };
};

// -------------------------------------------------------
// update Feed (owner only)
// -------------------------------------------------------
const updateFeed = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploaded: string[] = [];

  if (files?.files) {
    for (const file of files.files) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      let fileType: 'image' | 'video' | 'pdf' = 'pdf';

      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || ''))
        fileType = 'image';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || ''))
        fileType = 'video';

      const upload = await fileUploader.uploadToCloudinaryWithType(
        file,
        fileType,
      );

      uploaded.push(upload.Location);
    }
  }

  const existingFeed = await prisma.feed.findUnique({
    where: { id },
  });

  if (!existingFeed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  if (existingFeed.isLocked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Feed is locked and cannot be edited',
    );
  }

  const updatedData = {
    ...data,
    files: uploaded.length ? [...uploaded] : existingFeed.files,
  };

  const result = await prisma.feed.update({
    where: { id },
    data: updatedData,
    select: feedSelect,
  });

  return result;
};

// -------------------------------------------------------
// change Feed status (admin/moderator) + auto status history
// -------------------------------------------------------
const changeFeedStatus = async (req: Request) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const changedBy = req.user.id;

  const existingFeed = await prisma.feed.findUnique({ where: { id } });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const fromStatus = (existingFeed as any).status as FeedStatus;
  const toStatus = status as FeedStatus;

  if (fromStatus === toStatus)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Status is already set to this value',
    );

  const extraData: any = {};
  if (toStatus === 'Resolved') extraData.resolvedAt = new Date();
  if (toStatus === 'Closed') extraData.closedAt = new Date();

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

  // notify feed owner (skip if owner changed their own status)
  if (existingFeed.userId !== changedBy) {
    await createNotification({
      receiverId: existingFeed.userId,
      senderId: changedBy,
      title: 'Your Feed Status Changed',
      body: `Your post status changed from "${fromStatus}" to "${toStatus}"${note ? `: ${note}` : ''}`,
      referenceId: id,
      type: NotifyType.FeedStatusChanged,
    });
  }

  return updatedFeed;
};

// -------------------------------------------------------
// toggle pin Feed (admin only)
// -------------------------------------------------------
const togglePinFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({ where: { id } });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const result = await prisma.feed.update({
    where: { id },
    data: { isPinned: !(existingFeed as any).isPinned },
    select: feedSelect,
  });
  return result;
};

// -------------------------------------------------------
// toggle lock Feed (admin only)
// -------------------------------------------------------
const toggleLockFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({ where: { id } });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  const result = await prisma.feed.update({
    where: { id },
    data: { isLocked: !(existingFeed as any).isLocked },
    select: feedSelect,
  });
  return result;
};

// -------------------------------------------------------
// soft delete Feed
// -------------------------------------------------------
const softDeleteFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({ where: { id } });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if ((existingFeed as any).isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Feed is already deleted');

  const result = await prisma.feed.update({
    where: { id },
    data: { isDeleted: true },
    select: feedSelect,
  });
  return result;
};

// -------------------------------------------------------
// hard delete Feed
// -------------------------------------------------------
const deleteFeed = async (id: string) => {
  const existingFeed = await prisma.feed.findUnique({ where: { id } });
  if (!existingFeed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  await prisma.feed.delete({ where: { id } });
  return { message: 'Feed deleted successfully' };
};

// ═══════════════════════════════════════════════════════
// ASSIGNMENT
// ═══════════════════════════════════════════════════════

const assignModerator = async (req: Request) => {
  const { id: feedId } = req.params;
  const { moderatorId, note } = req.body;
  const assignedBy = req.user.id;

  const feed = await prisma.feed.findUnique({ where: { id: feedId } });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');

  // deactivate existing active assignment for same moderator
  await prisma.feedAssignment.updateMany({
    where: { feedId, moderatorId, isActive: true },
    data: { isActive: false, removedAt: new Date() },
  });

  const result = await prisma.feedAssignment.create({
    data: { feedId, moderatorId, assignedBy, note, isActive: true },
    include: {
      moderator: { select: { id: true, fullName: true, image: true } },
      assignedByUser: { select: { id: true, fullName: true } },
    },
  });

  // auto move status to UnderReview
  await prisma.feed.update({
    where: { id: feedId },
    data: { status: 'UnderReview' },
  });

  await createNotification({
    receiverId: moderatorId,
    senderId: assignedBy,
    title: 'Feed Assigned to You',
    body: `You have been assigned to a support feed: "${feed.title}"${note ? ` — ${note}` : ''}`,
    referenceId: feedId,
    type: NotifyType.FeedAssigned,
  });

  return result;
};

const removeModerator = async (req: Request) => {
  const { id: feedId, moderatorId } = req.params;

  const assignment = await prisma.feedAssignment.findFirst({
    where: { feedId, moderatorId, isActive: true },
  });
  if (!assignment)
    throw new ApiError(httpStatus.NOT_FOUND, 'Active assignment not found');

  const result = await prisma.feedAssignment.update({
    where: { id: assignment.id },
    data: { isActive: false, removedAt: new Date() },
  });
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

// -------------------------------------------------------
// reaction on feed Feed
// -------------------------------------------------------

const createReactionOnFeed = async (userId: string, feedId: string) => {
  const feed = await prisma.feed.findUnique({
    where: {
      id: feedId,
    },
  });

  if (!feed) {
    throw new ApiError(404, 'Article not found');
  }
  const existingFavorite = await prisma.feedReaction.findFirst({
    where: {
      userId,
      feedId,
    },
  });

  if (existingFavorite) {
    await prisma.feedReaction.delete({
      where: { id: existingFavorite.id },
    });
    return {
      feedId,
      isFavorite: false,
      data: {
        id: existingFavorite.id,
        userId: existingFavorite.userId,
        feedId: existingFavorite.feedId,
        isFavorite: false,
        createdAt: existingFavorite.createdAt,
        updatedAt: new Date(),
      },
    };
  } else {
    const newFavorite = await prisma.feedReaction.create({
      data: {
        userId,
        feedId,
        isFavorite: true,
      },
    });

    // notify feed owner (skip self-reaction)
    // if (feed.userId !== userId) {
    //   await createNotification({
    //     receiverId: feed.userId,
    //     senderId: userId,
    //     title: 'Someone Reacted to Your Feed',
    //     body: `Someone marked your post "${feed.title}" as favorite`,
    //     referenceId: feedId,
    //     type: NotifyType.FeedResponded,
    //   });
    // }

    return {
      feedId,
      isFavorite: true,
      data: newFavorite,
    };
  }
};

// ═══════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════

const createComment = async (req: Request) => {
  const { id: feedId } = req.params;
  const { content, parentId } = req.body;
  const userId = req.user.id;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploaded: string[] = [];

  if (files?.files) {
    for (const file of files.files) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      let fileType: 'image' | 'video' | 'pdf' = 'pdf';

      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || ''))
        fileType = 'image';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || ''))
        fileType = 'video';

      const upload = await fileUploader.uploadToCloudinaryWithType(
        file,
        fileType,
      );

      uploaded.push(upload.Location);
    }
  }

  const existingFeed = await prisma.feed.findUnique({
    where: { id: feedId },
  });

  if (!existingFeed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  const feed = await prisma.feed.findUnique({ where: { id: feedId } });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if ((feed as any).isLocked)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Feed is locked — comments disabled',
    );

  let parentComment = null;
  if (parentId) {
    parentComment = await prisma.feedComment.findUnique({
      where: { id: parentId },
    });
    if (!parentComment)
      throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
  }

  const result = await prisma.feedComment.create({
    data: {
      feedId,
      userId,
      content,
      parentId: parentId || null,
      attachments: uploaded.length ? [...uploaded] : existingFeed.files,
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

  if (parentId && parentComment) {
    // reply — notify parent comment author (if not replying to self)
    if (parentComment.userId !== userId) {
      await createNotification({
        receiverId: parentComment.userId,
        senderId: userId,
        title: 'New Reply to Your Comment',
        body: `Someone replied to your comment: "${content.slice(0, 80)}"`,
        referenceId: feedId,
        type: NotifyType.FeedReply,
      });
    }
  } else {
    // top-level comment — notify feed owner (if not commenting on own feed)
    if (feed.userId !== userId) {
      await createNotification({
        receiverId: feed.userId,
        senderId: userId,
        title: 'New Comment on Your Feed',
        body: `Someone commented on your post "${feed.title}": "${content.slice(0, 80)}"`,
        referenceId: feedId,
        type: NotifyType.FeedComment,
      });
    }
  }
  return result;
};

const getFeedComments = async (feedId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.feedComment.findMany({
    skip,
    take: limit,
    where: { feedId, parentId: null, isDeleted: false }, // top-level only
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
  });

  const total = await prisma.feedComment.count({
    where: { feedId, parentId: null, isDeleted: false },
  });
  return { meta: { total, page, limit }, data: result };
};

const updateComment = async (req: Request) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const comment = await prisma.feedComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  if ((comment as any).userId !== userId)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only edit your own comments',
    );

  return prisma.feedComment.update({
    where: { id: commentId },
    data: { content, isEdited: true },
    include: { author: { select: { id: true, fullName: true, image: true } } },
  });
};

const deleteComment = async (req: Request) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await prisma.feedComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  if ((comment as any).userId !== userId)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only delete your own comments',
    );

  return prisma.feedComment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });
};

const markCommentAsSolution = async (req: Request) => {
  const { id: feedId, commentId } = req.params;
  const userId = req.user.id;

  const feed = await prisma.feed.findUnique({ where: { id: feedId } });
  if (!feed) throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  if ((feed as any).userId !== userId)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only the feed owner can mark a solution',
    );

  // unmark existing solution
  await prisma.feedComment.updateMany({
    where: { feedId, isSolution: true },
    data: { isSolution: false },
  });

  return prisma.feedComment.update({
    where: { id: commentId },
    data: { isSolution: true },
  });
};

const getFeedStatusHistory = async (feedId: string) => {
  return prisma.feedStatusHistory.findMany({
    where: { feedId },
    orderBy: { createdAt: 'desc' },
    include: {
      changedByUser: { select: { id: true, fullName: true, image: true } },
    },
  });
};

export const feedService = {
  //feed
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
  //reaction
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
  //history
  getFeedStatusHistory,
};
