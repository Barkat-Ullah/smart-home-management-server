import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import {
  cacheOr,
  CacheKeys,
  TTL,
  CacheInvalidator,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { childSelect } from './child.select';
import { buildFilterConditions } from './child.utils';
import { fileUploader } from '../../utils/fileUploader';

// -------------------------------------------------------
// create Child
// -------------------------------------------------------
const createChild = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };
  const result = await prisma.child.create({
    data: addedData,
    select: childSelect,
  });

  await CacheInvalidator.onRecordCreate('child');
  return result;
};

// -------------------------------------------------------
// get all Child
// -------------------------------------------------------
type IChildFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
};

const childSearchAbleFields = ['fullName', 'email'];

const getChildList = async (
  options: IPaginationOptions,
  filters: IChildFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.list('child', { ...options, ...filters });
  return cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const andConditions: Prisma.ChildWhereInput[] = [];

      if (searchTerm) {
        andConditions.push({
          OR: childSearchAbleFields.map(field => ({
            [field]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.ChildWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const [result, total] = await Promise.all([
        prisma.child.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          select: childSelect,
        }),
        prisma.child.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    },
  ) ?? { meta: { total: 0, page, limit }, data: [] };
};

// -------------------------------------------------------
// get Child by id
// -------------------------------------------------------
const getChildById = async (id: string) => {
  const cacheKey = CacheKeys.single('child', id);
  const result = await cacheOr(cacheKey, TTL.MEDIUM, () =>
    prisma.child.findUnique({ where: { id }, select: childSelect }),
  );
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Child not found');
  }
  return result;
};

// -------------------------------------------------------
// get my Child
// -------------------------------------------------------
const getMyChild = async (
  req: Request,
  options: IPaginationOptions,
  filters: IChildFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.myList('child', userId, { ...options, ...filters });
  return cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const andConditions: Prisma.ChildWhereInput[] = [
        { userId },
        { isDeleted: false },
      ];

      if (searchTerm) {
        andConditions.push({
          OR: childSearchAbleFields.map(field => ({
            [field]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.ChildWhereInput = { AND: andConditions };

      const [result, total] = await Promise.all([
        prisma.child.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          select: childSelect,
        }),
        prisma.child.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    },
  ) ?? { meta: { total: 0, page, limit }, data: [] };
};

// -------------------------------------------------------
// update Child
// -------------------------------------------------------
const updateChild = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;
  const uploaded: string[] = [];

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

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

  const existingChild = await prisma.child.findUnique({ where: { id } });
  if (!existingChild) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Child not found');
  }
  const updateData = {
    ...data,
    files: uploaded.length ? [...uploaded] : existingChild.files,
  };

  const result = await prisma.child.update({
    where: { id },
    data: updateData,
    select: childSelect,
  });

  await CacheInvalidator.onOwnedRecordUpdate('child', id, existingChild.userId);
  return result;
};

// -------------------------------------------------------
// toggle status Child
// -------------------------------------------------------
const toggleStatusChild = async (id: string) => {
  const existingChild = await prisma.child.findUnique({ where: { id } });
  if (!existingChild) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Child not found');
  }
  const currentStatus = (existingChild as any).status;
  return null;
};

// -------------------------------------------------------
// soft delete Child
// -------------------------------------------------------
const softDeleteChild = async (id: string) => {
  const existingChild = await prisma.child.findUnique({ where: { id } });
  if (!existingChild) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Child not found');
  }
  if ((existingChild as any).isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Child is already deleted');
  }
  const result = await prisma.child.update({
    where: { id },
    data: { isDeleted: true },
    select: childSelect,
  });

  await CacheInvalidator.onRecordDelete('child', id, existingChild.userId);
  return result;
};

// -------------------------------------------------------
// hard delete Child
// -------------------------------------------------------
const deleteChild = async (id: string) => {
  const existingChild = await prisma.child.findUnique({ where: { id } });
  if (!existingChild) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Child not found');
  }
  const result = await prisma.child.delete({ where: { id } });
  await CacheInvalidator.onRecordDelete('child', id);
  return result;
};

export const childService = {
  createChild,
  getChildList,
  getChildById,
  getMyChild,
  updateChild,
  toggleStatusChild,
  softDeleteChild,
  deleteChild,
};