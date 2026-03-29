import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { smartDeviceSelect } from './smartDevice.select';
import { buildFilterConditions } from './smartDevice.utils';

// -------------------------------------------------------
// Create SmartDevice
// -------------------------------------------------------
const createSmartDevice = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  // Verify houseroom belongs to user
  const houseroom = await prisma.houseroom.findUnique({
    where: { id: data.houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  if (houseroom.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.smartDevice.create({
    data: { ...data, userId },
    select: smartDeviceSelect,
  });

  return result;
};

// -------------------------------------------------------
// Get all SmartDevices (admin)
// -------------------------------------------------------
type ISmartDeviceFilterRequest = {
  searchTerm?: string;
  id?: string;
  type?: string;
  status?: string;
  isOn?: string;
  isDeleted?: string;
  houseroomId?: string;
  createdAt?: string;
};

const smartDeviceSearchableFields = ['name', 'brand', 'model'];

const getSmartDeviceList = async (
  options: IPaginationOptions,
  filters: ISmartDeviceFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.SmartDeviceWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: smartDeviceSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.SmartDeviceWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.smartDevice.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: smartDeviceSelect,
    }),
    prisma.smartDevice.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get SmartDevice by ID
// -------------------------------------------------------
const getSmartDeviceById = async (id: string) => {
  const result = await prisma.smartDevice.findUnique({
    where: { id },
    select: smartDeviceSelect,
  });
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, 'Smart device not found');
  return result;
};

// -------------------------------------------------------
// Get MY SmartDevices
// -------------------------------------------------------
const getMySmartDevice = async (
  req: Request,
  options: IPaginationOptions,
  filters: ISmartDeviceFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.SmartDeviceWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: smartDeviceSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.SmartDeviceWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.smartDevice.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: smartDeviceSelect,
    }),
    prisma.smartDevice.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get Devices by Room
// -------------------------------------------------------
const getDevicesByRoom = async (req: Request, houseroomId: string) => {
  const userId = req.user.id;

  const houseroom = await prisma.houseroom.findUnique({
    where: { id: houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  if (houseroom.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.smartDevice.findMany({
    where: { houseroomId, userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: smartDeviceSelect,
  });

  return result;
};

// -------------------------------------------------------
// Update SmartDevice
// -------------------------------------------------------
const updateSmartDevice = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;

  const existing = await prisma.smartDevice.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Smart device not found');
  if (existing.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.smartDevice.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      type: data.type ?? existing.type,
      brand: data.brand ?? existing.brand,
      model: data.model ?? existing.model,
      iconUrl: data.iconUrl ?? existing.iconUrl,
      isOn: data.isOn ?? existing.isOn,
      status: data.status ?? existing.status,
      powerUsage: data.powerUsage ?? existing.powerUsage,
      activeHours: data.activeHours ?? existing.activeHours,
      controlType: data.controlType ?? existing.controlType,
      controlId: data.controlId ?? existing.controlId,
      controlMeta: data.controlMeta ?? existing.controlMeta,
      houseroomId: data.houseroomId ?? existing.houseroomId,
    },
    select: smartDeviceSelect,
  });

  return result;
};

// -------------------------------------------------------
// Toggle ON/OFF
// -------------------------------------------------------
const toggleSmartDevice = async (id: string, userId: string) => {
  const existing = await prisma.smartDevice.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Smart device not found');
  if (existing.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.smartDevice.update({
    where: { id },
    data: {
      isOn: !existing.isOn,
      lastSeenAt: new Date(),
    },
    select: smartDeviceSelect,
  });

  return result;
};

// -------------------------------------------------------
// Soft Delete SmartDevice
// -------------------------------------------------------
const softDeleteSmartDevice = async (id: string, userId: string) => {
  const existing = await prisma.smartDevice.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Smart device not found');
  if (existing.userId !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  if (existing.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Device already deleted');

  const result = await prisma.smartDevice.update({
    where: { id },
    data: { isDeleted: true },
    select: smartDeviceSelect,
  });

  return result;
};

// -------------------------------------------------------
// Hard Delete SmartDevice
// -------------------------------------------------------
const deleteSmartDevice = async (id: string) => {
  const existing = await prisma.smartDevice.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Smart device not found');

  await prisma.smartDevice.delete({ where: { id } });
  return { message: 'Smart device permanently deleted' };
};

export const smartDeviceService = {
  createSmartDevice,
  getSmartDeviceList,
  getSmartDeviceById,
  getMySmartDevice,
  getDevicesByRoom,
  updateSmartDevice,
  toggleSmartDevice,
  softDeleteSmartDevice,
  deleteSmartDevice,
};
