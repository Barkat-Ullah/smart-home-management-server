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
import { inventorySelect } from './inventory.select';
import {
  toUTCEndOfDay,
  toUTCEndOfMonth,
  toUTCStartOfDay,
  toUTCStartOfMonth,
} from '../event/event.utils';

// -------------------------------------------------------
// create Inventory
// -------------------------------------------------------
const createInventory = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const addedData = { ...data, userId };
  const result = await prisma.inventory.create({
    data: addedData,
    select: inventorySelect,
  });
  return result;
};

// -------------------------------------------------------
// get all Inventory
// -------------------------------------------------------
type IInventoryFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
};

const inventorySearchAbleFields = ['title', 'location'];

const getInventoryList = async (
  options: IPaginationOptions,
  filters: IInventoryFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.InventoryWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: inventorySearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (value === '' || value === null || value === undefined) return;

      if (key === 'createdAt') {
        const parts = (value as string).split('-');

        if (parts.length === 2) {
          // Format: "YYYY-MM" →
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          andConditions.push({
            createdAt: {
              gte: toUTCStartOfMonth(year, month),
              lte: toUTCEndOfMonth(year, month),
            },
          });
        } else if (parts.length === 3) {
          // Format: "YYYY-MM-DD" →
          andConditions.push({
            createdAt: {
              gte: toUTCStartOfDay(value),
              lte: toUTCEndOfDay(value),
            },
          });
        }
        return;
      }

      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({ [relation]: { some: { [field]: value } } });
        return;
      }

      andConditions.push({ [key]: value });
    });
  }

  const whereConditions: Prisma.InventoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.inventory.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: inventorySelect,
    }),
    prisma.inventory.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Inventory by id
// -------------------------------------------------------
const getInventoryById = async (id: string) => {
  const result = await prisma.inventory.findUnique({
    where: { id },
    select: inventorySelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }
  return result;
};

// -------------------------------------------------------
// get my Inventory
// -------------------------------------------------------
const getMyInventory = async (
  req: Request,
  options: IPaginationOptions,
  filters: IInventoryFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.InventoryWhereInput[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      OR: inventorySearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (value === '' || value === null || value === undefined) return;

      if (key === 'createdAt' && value) {
        const parts = (value as string).split('-');
        if (parts.length === 2) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const start = new Date(year, month, 1, 0, 0, 0, 0);
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
          andConditions.push({
            createdAt: { gte: start.toISOString(), lte: end.toISOString() },
          });
        } else {
          const start = new Date(value);
          start.setHours(0, 0, 0, 0);
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);
          andConditions.push({
            createdAt: { gte: start.toISOString(), lte: end.toISOString() },
          });
        }
        return;
      }

      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({ [relation]: { some: { [field]: value } } });
        return;
      }

      andConditions.push({ [key]: value });
    });
  }

  const whereConditions: Prisma.InventoryWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.inventory.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: inventorySelect,
    }),
    prisma.inventory.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update Inventory
// -------------------------------------------------------
const updateInventory = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  if (!existingInventory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }

  const result = await prisma.inventory.update({
    where: { id },
    data: {
      userId: data.userId ?? (existingInventory as any).userId,
      title: data.title ?? (existingInventory as any).title,
      location: data.location ?? (existingInventory as any).location,
      item: data.item ?? (existingInventory as any).item,
      category: data.category ?? (existingInventory as any).category,
      isDeleted: data.isDeleted ?? (existingInventory as any).isDeleted,
    },
    select: inventorySelect,
  });

  return result;
};

// -------------------------------------------------------
// toggle status Inventory
// -------------------------------------------------------
const toggleStatusInventory = async (id: string) => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  if (!existingInventory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }

  // TODO: define your status enum toggle logic below

  const currentStatus = (existingInventory as any).status;
  const newStatus = currentStatus === 'Pending' ? 'Done' : 'Pending';
  const result = await prisma.inventory.update({
    where: { id },
    data: { status: newStatus, updatedAt: new Date() },
    select: inventorySelect,
  });

  return result;
};

// -------------------------------------------------------
// soft delete Inventory
// -------------------------------------------------------
const softDeleteInventory = async (id: string) => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  if (!existingInventory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }
  if ((existingInventory as any).isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Inventory is already deleted');
  }
  const result = await prisma.inventory.update({
    where: { id },
    data: { isDeleted: true },
    select: inventorySelect,
  });
  return result;
};

// -------------------------------------------------------
// hard delete Inventory
// -------------------------------------------------------
const deleteInventory = async (id: string) => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  if (!existingInventory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }
  const result = await prisma.inventory.delete({ where: { id } });
  return result;
};

export const inventoryService = {
  createInventory,
  getInventoryList,
  getInventoryById,
  getMyInventory,
  updateInventory,
  toggleStatusInventory,
  softDeleteInventory,
  deleteInventory,
};
