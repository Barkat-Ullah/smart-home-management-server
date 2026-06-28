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
import { mealSelect } from './meal.select';
import { buildMealFilterConditions } from './meal.utils';

// -------------------------------------------------------
// create Meal
// -------------------------------------------------------
const createMeal = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);

  const result = await prisma.meal.create({
    data: { ...data, ...uploadedFiles, userId },
    select: mealSelect,
  });

  return result;
};

// -------------------------------------------------------
// get all Meals (admin)
// -------------------------------------------------------
type IMealFilterRequest = {
  searchTerm?: string;
  createdAt?: string;
};

const mealSearchableFields = ['title', 'description'];

const getMealList = async (
  options: IPaginationOptions,
  filters: IMealFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MealWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: mealSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildMealFilterConditions(filterData));
  }

  const whereConditions: Prisma.MealWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.meal.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: mealSelect,
    }),
    prisma.meal.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get my Meals
// -------------------------------------------------------
const getMyMeals = async (
  req: Request,
  options: IPaginationOptions,
  filters: IMealFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MealWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: mealSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildMealFilterConditions(filterData));
  }

  const whereConditions: Prisma.MealWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.meal.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'asc' },
      select: mealSelect,
    }),
    prisma.meal.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Meal by id
// -------------------------------------------------------
const getMealById = async (id: string) => {
  const result = await prisma.meal.findFirst({
    where: { id },
    select: mealSelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
  }

  return result;
};

// -------------------------------------------------------
// update Meal
// -------------------------------------------------------
const updateMeal = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);

  const existing = await prisma.meal.findFirst({
    where: { id },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
  }

  const result = await prisma.meal.update({
    where: { id },
    data: { ...data, ...uploadedFiles },
    select: mealSelect,
  });

  return result;
};

// -------------------------------------------------------
// soft delete Meal
// -------------------------------------------------------
const deleteMeal = async (id: string) => {
  const existing = await prisma.meal.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
  }

  return prisma.meal.update({
    where: { id },
    data: { isDeleted: true },
    select: { id: true },
  });
};

export const mealService = {
  createMeal,
  getMealList,
  getMyMeals,
  getMealById,
  updateMeal,
  deleteMeal,
};
