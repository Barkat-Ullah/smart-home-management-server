import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { cacheOr, CacheKeys, TTL, CacheInvalidator } from '../../../lib/redis';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { cctvCameraSelect } from './cctvCamera.select';
import { buildFilterConditions } from './cctvCamera.utils';

const MODEL = 'cctvCamera';

const createCctvCamera = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const houseroom = await prisma.houseroom.findUnique({
    where: { id: data.houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  const result = await prisma.cctvCamera.create({
    data: { ...data, userId },
    select: cctvCameraSelect,
  });
  await CacheInvalidator.onRecordCreate(MODEL);
  return result;
};

type ICctvCameraFilterRequest = {
  searchTerm?: string;
  id?: string;
  status?: string;
  isDeleted?: string;
  houseroomId?: string;
  createdAt?: string;
};
const cctvCameraSearchableFields = ['name', 'brand', 'model'];

const getCctvCameraList = async (
  options: IPaginationOptions,
  filters: ICctvCameraFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const cacheKey = CacheKeys.list(MODEL, { ...options, ...filters });
  return (
    cacheOr<{
      meta: { total: number; page: number; limit: number };
      data: any[];
    }>(cacheKey, TTL.SHORT, async () => {
      const andConditions: Prisma.CctvCameraWhereInput[] = [];
      if (searchTerm)
        andConditions.push({
          OR: cctvCameraSearchableFields.map(f => ({
            [f]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      if (Object.keys(filterData).length)
        andConditions.push(...buildFilterConditions(filterData));
      const w = andConditions.length ? { AND: andConditions } : {};
      const [result, total] = await Promise.all([
        prisma.cctvCamera.findMany({
          skip,
          take: limit,
          where: w,
          orderBy: { createdAt: 'desc' },
          select: cctvCameraSelect,
        }),
        prisma.cctvCamera.count({ where: w }),
      ]);
      return { meta: { total, page, limit }, data: result };
    }) ?? { meta: { total: 0, page, limit }, data: [] }
  );
};

const getCctvCameraById = async (id: string) => {
  const cacheKey = CacheKeys.single(MODEL, id);
  const result = await cacheOr(cacheKey, TTL.MEDIUM, () =>
    prisma.cctvCamera.findUnique({ where: { id }, select: cctvCameraSelect }),
  );
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  return result;
};

const getCameraStream = async (id: string) => {
  const camera = await prisma.cctvCamera.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      streamUrl: true,
      username: true,
      password: true,
      status: true,
      isDeleted: true,
    },
  });
  if (!camera) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  if (camera.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Camera is deleted');
  return {
    id: camera.id,
    name: camera.name,
    streamUrl: camera.streamUrl,
    username: camera.username ?? null,
    password: camera.password ?? null,
    status: camera.status,
  };
};

const getMyCctvCamera = async (
  req: Request,
  options: IPaginationOptions,
  filters: ICctvCameraFilterRequest,
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
      const andConditions: Prisma.CctvCameraWhereInput[] = [
        { userId },
        { isDeleted: false },
      ];
      if (searchTerm)
        andConditions.push({
          OR: cctvCameraSearchableFields.map(f => ({
            [f]: { contains: searchTerm, mode: 'insensitive' },
          })),
        });
      if (Object.keys(filterData).length)
        andConditions.push(...buildFilterConditions(filterData));
      const w = { AND: andConditions };
      const [result, total] = await Promise.all([
        prisma.cctvCamera.findMany({
          skip,
          take: limit,
          where: w,
          orderBy: { createdAt: 'desc' },
          select: cctvCameraSelect,
        }),
        prisma.cctvCamera.count({ where: w }),
      ]);
      return { meta: { total, page, limit }, data: result };
    }) ?? { meta: { total: 0, page, limit }, data: [] }
  );
};

const getCamerasByRoom = async (req: Request, houseroomId: string) => {
  const userId = req.user.id;
  const houseroom = await prisma.houseroom.findUnique({
    where: { id: houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  return prisma.cctvCamera.findMany({
    where: { houseroomId, userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: cctvCameraSelect,
  });
};

const updateCctvCamera = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  const result = await prisma.cctvCamera.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      streamUrl: data.streamUrl ?? existing.streamUrl,
      username: data.username ?? existing.username,
      password: data.password ?? existing.password,
      brand: data.brand ?? existing.brand,
      model: data.model ?? existing.model,
      status: data.status ?? existing.status,
      houseroomId: data.houseroomId ?? existing.houseroomId,
    },
    select: cctvCameraSelect,
  });
  await CacheInvalidator.onOwnedRecordUpdate(MODEL, id, userId);
  return result;
};

const toggleStatusCctvCamera = async (id: string, userId: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  const result = await prisma.cctvCamera.update({
    where: { id },
    data: { status: existing.status === 'Online' ? 'Offline' : 'Online' },
    select: cctvCameraSelect,
  });
  await CacheInvalidator.onOwnedRecordUpdate(MODEL, id, userId);
  return result;
};

const softDeleteCctvCamera = async (id: string, userId: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  if (existing.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Camera already deleted');
  const result = await prisma.cctvCamera.update({
    where: { id },
    data: { isDeleted: true },
    select: cctvCameraSelect,
  });
  await CacheInvalidator.onRecordDelete(MODEL, id, userId);
  return result;
};

const deleteCctvCamera = async (id: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  await prisma.cctvCamera.delete({ where: { id } });
  await CacheInvalidator.onRecordDelete(MODEL, id);
  return { message: 'Camera permanently deleted' };
};

export const cctvCameraService = {
  createCctvCamera,
  getCctvCameraList,
  getCctvCameraById,
  getCameraStream,
  getMyCctvCamera,
  getCamerasByRoom,
  updateCctvCamera,
  toggleStatusCctvCamera,
  softDeleteCctvCamera,
  deleteCctvCamera,
};
