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
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { houseroomSelect } from './houseroom.select';
import { buildFilterConditions } from './houseroom.utils';

const MODEL = 'houseroom';

// -------------------------------------------------------
// Create Houseroom
// -------------------------------------------------------
const createHouseroom = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);

  const result = await prisma.houseroom.create({
    data: { ...data, ...uploadedFiles, userId, isDefault: false },
    select: houseroomSelect,
  });

  await CacheInvalidator.onRecordCreate(MODEL);
  return result;
};

// -------------------------------------------------------
// Get all Houserooms (admin)
// -------------------------------------------------------
type IHouseroomFilterRequest = {
  searchTerm?: string;
  id?: string;
  type?: string;
  isDefault?: string;
  isDeleted?: string;
  createdAt?: string;
};

const houseroomSearchableFields = ['name'];

const getHouseroomList = async (
  options: IPaginationOptions,
  filters: IHouseroomFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.list(MODEL, { ...options, ...filters });
  return (
    cacheOr<{
      meta: { total: number; page: number; limit: number };
      data: any[];
    }>(cacheKey, TTL.SHORT, async () => {
      const andConditions: Prisma.HouseroomWhereInput[] = [];

      if (searchTerm) {
        andConditions.push({
          OR: houseroomSearchableFields.map(field => ({
            [field]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.HouseroomWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const [result, total] = await Promise.all([
        prisma.houseroom.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          select: houseroomSelect,
        }),
        prisma.houseroom.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    }) ?? { meta: { total: 0, page, limit }, data: [] }
  );
};

// -------------------------------------------------------
// Get Houseroom by ID
// -------------------------------------------------------
const getHouseroomById = async (id: string) => {
  const result = await prisma.houseroom.findUnique({
    where: { id },
    select: houseroomSelect,
  });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  return result;
};

// -------------------------------------------------------
// Get MY Houserooms (current user)
// -------------------------------------------------------
const getMyHouseroom = async (
  req: Request,
  options: IPaginationOptions,
  filters: IHouseroomFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.myList(MODEL, userId, { ...options, ...filters });
  return (
    cacheOr<{
      meta: { total: number; page: number; limit: number };
      data: any[];
    }>(cacheKey, TTL.SHORT, async () => {
      const andConditions: Prisma.HouseroomWhereInput[] = [
        { userId },
        { isDeleted: false },
      ];

      if (searchTerm) {
        andConditions.push({
          OR: houseroomSearchableFields.map(field => ({
            [field]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      }

      if (Object.keys(filterData).length) {
        andConditions.push(...buildFilterConditions(filterData));
      }

      const whereConditions: Prisma.HouseroomWhereInput = {
        AND: andConditions,
      };

      const [result, total] = await Promise.all([
        prisma.houseroom.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
          select: houseroomSelect,
        }),
        prisma.houseroom.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    }) ?? { meta: { total: 0, page, limit }, data: [] }
  );
};

// -------------------------------------------------------
// Update Houseroom
// -------------------------------------------------------
const updateHouseroom = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);

  const existingHouseroom = await prisma.houseroom.findUnique({
    where: { id },
  });
  if (!existingHouseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');

  if (existingHouseroom.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.houseroom.update({
    where: { id },
    data: {
      name: data.name ?? existingHouseroom.name,
      type: data.type ?? existingHouseroom.type,
      files: uploadedFiles?.files ?? data.files ?? existingHouseroom.files,
    },
    select: houseroomSelect,
  });

  await CacheInvalidator.onOwnedRecordUpdate(MODEL, id, userId);
  return result;
};

// -------------------------------------------------------
// Soft Delete Houseroom
// -------------------------------------------------------
const softDeleteHouseroom = async (id: string, userId: string) => {
  const existingHouseroom = await prisma.houseroom.findUnique({
    where: { id },
  });
  if (!existingHouseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');

  if (existingHouseroom.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  if (existingHouseroom.isDefault)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Default rooms cannot be deleted',
    );

  if (existingHouseroom.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Houseroom already deleted');

  const result = await prisma.houseroom.update({
    where: { id },
    data: { isDeleted: true },
    select: houseroomSelect,
  });

  await CacheInvalidator.onRecordDelete(MODEL, id, userId);
  return result;
};

// -------------------------------------------------------
// Hard Delete Houseroom
// -------------------------------------------------------
const deleteHouseroom = async (id: string) => {
  const existingHouseroom = await prisma.houseroom.findUnique({
    where: { id },
  });
  if (!existingHouseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');

  if (existingHouseroom.isDefault)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Default rooms cannot be deleted',
    );

  await prisma.$transaction([
    prisma.smartDevice.deleteMany({ where: { houseroomId: id } }),
    prisma.airConditioner.deleteMany({ where: { houseroomId: id } }),
    prisma.cctvCamera.deleteMany({ where: { houseroomId: id } }),
    prisma.houseroom.delete({ where: { id } }),
  ]);

  await CacheInvalidator.onRecordDelete(MODEL, id);
  return { message: 'Houseroom permanently deleted' };
};

export const houseroomService = {
  createHouseroom,
  getHouseroomList,
  getHouseroomById,
  getMyHouseroom,
  updateHouseroom,
  softDeleteHouseroom,
  deleteHouseroom,
};
