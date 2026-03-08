import httpStatus from 'http-status';
import { FeedStatus, Prisma, UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { feedSelect } from './feed.select';
import { buildFilterConditions } from './feed.utils';
import { fileUploader } from '../../utils/fileUploader';

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

  const result = await prisma.feed.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      priority: true,
      tags: true,
      viewCount: true,
      createdAt: true,
      files: true,
      createdBy: {
        select: { id: true, fullName: true, email: true, image: true },
      },
    },
  });

  const total = await prisma.feed.count({ where: whereConditions });
  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Feed by id (increments viewCount)
// -------------------------------------------------------
const getFeedById = async (id: string) => {
  const result = await prisma.feed.findUnique({
    where: { id },
    select: feedSelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feed not found');
  }

  // increment view count
  await prisma.feed.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return result;
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

  const whereConditions: Prisma.FeedWhereInput = { AND: andConditions };

  const result = await prisma.feed.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { createdAt: 'desc' },
    select: feedSelect,
  });

  const total = await prisma.feed.count({ where: whereConditions });
  return { meta: { total, page, limit }, data: result };
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
    files: uploaded.length
      ? [...uploaded]
      : existingFeed.files,
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

export const feedService = {
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
};
