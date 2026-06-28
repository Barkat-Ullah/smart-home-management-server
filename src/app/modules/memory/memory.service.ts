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
import { memorySelect } from './memory.select';
import { buildFilterConditions } from './memory.utils';

// -------------------------------------------------------
// create Memory
// -------------------------------------------------------
const createMemory = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };
  const result = await prisma.memory.create({
    data: addedData,
    select: memorySelect,
  });
  return result;
};

// -------------------------------------------------------
// get all Memory
// -------------------------------------------------------
type IMemoryFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  memoryOf?: string;
};

const memorySearchAbleFields = ['title'];

const getMemoryList = async (
  options: IPaginationOptions,
  filters: IMemoryFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MemoryWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: memorySearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.MemoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.memory.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: memorySelect,
    }),
    prisma.memory.count({ where: whereConditions }),
  ]);
  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Memory by id
// -------------------------------------------------------
const getMemoryById = async (id: string) => {
  const result = await prisma.memory.findUnique({
    where: { id },
    select: memorySelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Memory not found');
  }
  return result;
};

// -------------------------------------------------------
// get my Memory
// -------------------------------------------------------
const getMyMemory = async (
  req: Request,
  options: IPaginationOptions,
  filters: IMemoryFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MemoryWhereInput[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      OR: memorySearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.MemoryWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.memory.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: memorySelect,
    }),
    prisma.memory.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update Memory
// -------------------------------------------------------
const updateMemory = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const updatedData = { ...data, ...uploadedFiles };

  const existingMemory = await prisma.memory.findUnique({ where: { id } });
  if (!existingMemory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Memory not found');
  }

  const result = await prisma.memory.update({
    where: { id },
    data: updatedData,
    select: memorySelect,
  });

  return result;
};

// -------------------------------------------------------
// toggle status Memory
// -------------------------------------------------------
const toggleStatusMemory = async (id: string) => {
  const existingMemory = await prisma.memory.findUnique({ where: { id } });
  if (!existingMemory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Memory not found');
  }

  // TODO: define your status enum toggle logic below
  // Example for enum: { ACTIVE -> INACTIVE, INACTIVE -> ACTIVE }
  const currentStatus = (existingMemory as any).status;
  // const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  // const result = await prisma.memory.update({
  //   where: { id },
  //   data: { status: currentStatus /* replace with newStatus */ },
  //   select: memorySelect,
  // });

  return null;
};

// -------------------------------------------------------
// soft delete Memory
// -------------------------------------------------------
const softDeleteMemory = async (id: string) => {
  const existingMemory = await prisma.memory.findUnique({ where: { id } });
  if (!existingMemory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Memory not found');
  }
  if ((existingMemory as any).isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Memory is already deleted');
  }
  // const result = await prisma.memory.update({
  //   where: { id },
  //   data: { isDeleted: true },
  //   select: memorySelect,
  // });
  // return result;
};

// -------------------------------------------------------
// hard delete Memory
// -------------------------------------------------------
const deleteMemory = async (id: string) => {
  const existingMemory = await prisma.memory.findUnique({ where: { id } });
  if (!existingMemory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Memory not found');
  }
  const result = await prisma.memory.delete({ where: { id } });
  return result;
};

export const memoryService = {
  createMemory,
  getMemoryList,
  getMemoryById,
  getMyMemory,
  updateMemory,
  toggleStatusMemory,
  softDeleteMemory,
  deleteMemory,
};
