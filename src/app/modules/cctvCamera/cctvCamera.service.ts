import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { cctvCameraSelect } from './cctvCamera.select';
import { buildFilterConditions } from './cctvCamera.utils';

// -------------------------------------------------------
// Create CctvCamera
// -------------------------------------------------------
const createCctvCamera = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  // Verify houseroom belongs to user
  const houseroom = await prisma.houseroom.findUnique({
    where: { id: data.houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  // if (houseroom.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.cctvCamera.create({
    data: { ...data, userId },
    select: cctvCameraSelect,
  });

  return result;
};

// -------------------------------------------------------
// Get All CctvCameras (admin)
// -------------------------------------------------------
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

  const andConditions: Prisma.CctvCameraWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: cctvCameraSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.CctvCameraWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.cctvCamera.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: cctvCameraSelect,
    }),
    prisma.cctvCamera.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get CctvCamera by ID
// -------------------------------------------------------
const getCctvCameraById = async (id: string, userId: string) => {
  const result = await prisma.cctvCamera.findUnique({
    where: { id },
    select: cctvCameraSelect,
  });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  // if (result.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  return result;
};

// -------------------------------------------------------
// Get Stream URL (returns streamUrl + credentials separately)
// -------------------------------------------------------
const getCameraStream = async (id: string, userId: string) => {
  const camera = await prisma.cctvCamera.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      streamUrl: true,
      username: true,
      password: true, // only here — do NOT expose in general selects
      status: true,
      isDeleted: true,
    },
  });

  if (!camera) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  // if (camera.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
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

// -------------------------------------------------------
// Get MY CctvCameras
// -------------------------------------------------------
const getMyCctvCamera = async (
  req: Request,
  options: IPaginationOptions,
  filters: ICctvCameraFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.CctvCameraWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: cctvCameraSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.CctvCameraWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.cctvCamera.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: cctvCameraSelect,
    }),
    prisma.cctvCamera.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get Cameras by Room
// -------------------------------------------------------
const getCamerasByRoom = async (req: Request, houseroomId: string) => {
  const userId = req.user.id;

  const houseroom = await prisma.houseroom.findUnique({
    where: { id: houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  // if (houseroom.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.cctvCamera.findMany({
    where: { houseroomId, userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: cctvCameraSelect,
  });

  return result;
};

// -------------------------------------------------------
// Update CctvCamera
// -------------------------------------------------------
const updateCctvCamera = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;

  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

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

  return result;
};

// -------------------------------------------------------
// Toggle Status (Online / Offline)
// -------------------------------------------------------
const toggleStatusCctvCamera = async (id: string, userId: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const newStatus = existing.status === 'Online' ? 'Offline' : 'Online';

  const result = await prisma.cctvCamera.update({
    where: { id },
    data: { status: newStatus },
    select: cctvCameraSelect,
  });

  return result;
};

// -------------------------------------------------------
// Soft Delete CctvCamera
// -------------------------------------------------------
const softDeleteCctvCamera = async (id: string, userId: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  if (existing.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Camera already deleted');

  const result = await prisma.cctvCamera.update({
    where: { id },
    data: { isDeleted: true },
    select: cctvCameraSelect,
  });

  return result;
};

// -------------------------------------------------------
// Hard Delete CctvCamera
// -------------------------------------------------------
const deleteCctvCamera = async (id: string) => {
  const existing = await prisma.cctvCamera.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Camera not found');

  await prisma.cctvCamera.delete({ where: { id } });
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
