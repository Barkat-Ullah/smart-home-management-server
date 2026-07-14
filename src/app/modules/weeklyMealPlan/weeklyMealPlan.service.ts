import httpStatus from 'http-status';
import { Prisma, WeeklyPlanStatus } from '@prisma/client';
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
import {
  weeklyMealPlanSelect,
  weeklyMealPlanWithDaysSelect,
} from './weeklyMealPlan.select';
import {
  buildWeeklyPlanFilterConditions,
  buildWeekDays,
  getNextWeekNumber,
  getMondayOfWeek,
  getSundayOfWeek,
} from './weeklyMealPlan.utils';

// -------------------------------------------------------
// create WeeklyMealPlan
// Auto-creates 7 MealPlanDay records (Mon–Sun)
// -------------------------------------------------------
const createWeeklyMealPlan = async (req: Request) => {
  const userId = req.user.id;
  const { startDate, notes } = req.body;

  // Derive Monday & Sunday from provided date
  const monday = getMondayOfWeek(new Date(startDate));
  const sunday = getSundayOfWeek(new Date(startDate));

  // Check if a plan already exists for this week
  const existing = await prisma.weeklyMealPlan.findFirst({
    where: {
      userId,
      isDeleted: false,
      startDate: { lte: sunday },
      endDate: { gte: monday },
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'A meal plan already exists for this week',
    );
  }

  const weekNumber = await getNextWeekNumber(prisma, userId);

  // Create plan + 7 days in one transaction
  const plan = await prisma.$transaction(async tx => {
    const weeklyPlan = await tx.weeklyMealPlan.create({
      data: {
        userId,
        weekNumber,
        startDate: monday,
        endDate: sunday,
        notes,
      },
      select: weeklyMealPlanSelect,
    });

    // Auto-generate Mon–Sun day records
    const dayRecords = buildWeekDays(weeklyPlan.id, userId, monday);
    await tx.mealPlanDay.createMany({ data: dayRecords });

    return weeklyPlan;
  });

  return plan;
};

// -------------------------------------------------------
// get all WeeklyMealPlans (admin)
// -------------------------------------------------------
type IWeeklyPlanFilterRequest = {
  searchTerm?: string;
  status?: string;
  createdAt?: string;
};

const getWeeklyMealPlanList = async (
  options: IPaginationOptions,
  filters: IWeeklyPlanFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.list('weeklyMealPlan', { ...options, ...filters });
  const cached = await cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const andConditions: Prisma.WeeklyMealPlanWhereInput[] = [];

      if (Object.keys(filterData).length) {
        andConditions.push(...buildWeeklyPlanFilterConditions(filterData));
      }

      const whereConditions: Prisma.WeeklyMealPlanWhereInput = {
        AND: andConditions,
      };

      const [result, total] = await Promise.all([
        prisma.weeklyMealPlan.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { weekNumber: 'desc' },
          select: weeklyMealPlanSelect,
        }),
        prisma.weeklyMealPlan.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    },
  );

  return cached ?? { meta: { total: 0, page, limit }, data: [] };
};

// -------------------------------------------------------
// get my WeeklyMealPlans
// -------------------------------------------------------
const getMyWeeklyMealPlans = async (
  req: Request,
  options: IPaginationOptions,
  filters: IWeeklyPlanFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.myList('weeklyMealPlan', userId, { ...options, ...filters });
  const cached = await cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
      const andConditions: Prisma.WeeklyMealPlanWhereInput[] = [
        { userId },
        { isDeleted: false },
      ];

      if (Object.keys(filterData).length) {
        andConditions.push(...buildWeeklyPlanFilterConditions(filterData));
      }

      const whereConditions: Prisma.WeeklyMealPlanWhereInput = {
        AND: andConditions,
      };

      const [result, total] = await Promise.all([
        prisma.weeklyMealPlan.findMany({
          skip,
          take: limit,
          where: whereConditions,
          orderBy: { weekNumber: 'desc' },
          select: weeklyMealPlanSelect,
        }),
        prisma.weeklyMealPlan.count({ where: whereConditions }),
      ]);

      return { meta: { total, page, limit }, data: result };
    },
  );

  return cached ?? { meta: { total: 0, page, limit }, data: [] };
};

// -------------------------------------------------------
// get WeeklyMealPlan by id (with all days + items)
// -------------------------------------------------------
const getWeeklyMealPlanById = async (id: string) => {
  const cacheKey = CacheKeys.single('weeklyMealPlan', id);
  const result = await cacheOr(cacheKey, TTL.MEDIUM, async () => {
    return prisma.weeklyMealPlan.findFirst({
      where: { id },
      select: weeklyMealPlanWithDaysSelect,
    });
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Weekly meal plan not found');
  }

  return result;
};

// -------------------------------------------------------
// get current week's plan for logged-in user
// -------------------------------------------------------
const getCurrentWeekPlan = async (req: Request) => {
  const userId = req.user.id;
  const now = new Date();
  const monday = getMondayOfWeek(now);
  const sunday = getSundayOfWeek(now);

  const result = await prisma.weeklyMealPlan.findFirst({
    where: {
      userId,
      isDeleted: false,
      startDate: { lte: sunday },
      endDate: { gte: monday },
    },
    select: weeklyMealPlanWithDaysSelect,
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No meal plan found for current week',
    );
  }

  return result;
};

// -------------------------------------------------------
// update WeeklyMealPlan (notes / status)
// -------------------------------------------------------
const updateWeeklyMealPlan = async (req: Request) => {
  const { id } = req.params;
  const { notes, status } = req.body;

  const existing = await prisma.weeklyMealPlan.findFirst({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Weekly meal plan not found');
  }

  const result = await prisma.weeklyMealPlan.update({
    where: { id },
    data: {
      notes,
      status,
      ...(status === WeeklyPlanStatus.Completed && { completedAt: new Date() }),
    },
    select: weeklyMealPlanSelect,
  });

  await CacheInvalidator.onRecordUpdate('weeklyMealPlan', id);

  return result;
};

// -------------------------------------------------------
// soft delete WeeklyMealPlan
// -------------------------------------------------------
const deleteWeeklyMealPlan = async (id: string) => {
  const existing = await prisma.weeklyMealPlan.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Weekly meal plan not found');
  }

  const result = await prisma.weeklyMealPlan.update({
    where: { id },
    data: { isDeleted: true },
    select: { id: true },
  });

  await CacheInvalidator.onRecordDelete('weeklyMealPlan', id);

  return result;
};

export const weeklyMealPlanService = {
  createWeeklyMealPlan,
  getWeeklyMealPlanList,
  getMyWeeklyMealPlans,
  getWeeklyMealPlanById,
  getCurrentWeekPlan,
  updateWeeklyMealPlan,
  deleteWeeklyMealPlan,
};
