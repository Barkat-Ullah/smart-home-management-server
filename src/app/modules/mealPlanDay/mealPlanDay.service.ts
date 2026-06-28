import httpStatus from 'http-status';
import { MealPlanDayStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import {
  cacheOr,
  CacheKeys,
  TTL,
  CacheInvalidator,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { mealPlanDaySelect } from './mealPlanDay.select';

// -------------------------------------------------------
// get a single day by id
// -------------------------------------------------------
const getMealPlanDayById = async (id: string) => {
  const result = await prisma.mealPlanDay.findUnique({
    where: { id },
    select: mealPlanDaySelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal plan day not found');
  }

  return result;
};

// -------------------------------------------------------
// get all days for a weekly plan
// -------------------------------------------------------
const getDaysByWeeklyPlan = async (weeklyPlanId: string, userId: string) => {
  // Verify plan belongs to user
  const plan = await prisma.weeklyMealPlan.findFirst({
    where: { id: weeklyPlanId, userId, isDeleted: false },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Weekly meal plan not found');
  }

  return prisma.mealPlanDay.findMany({
    where: { weeklyPlanId },
    orderBy: { date: 'asc' },
    select: mealPlanDaySelect,
  });
};

// -------------------------------------------------------
// update a day — status / notes / caregiver
// -------------------------------------------------------
const updateMealPlanDay = async (req: Request) => {
  const { id } = req.params;
  const { status, notes, caregiverId } = req.body;

  const existing = await prisma.mealPlanDay.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal plan day not found');
  }

  if (existing.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return prisma.mealPlanDay.update({
    where: { id },
    data: { status, notes, caregiverId },
    select: mealPlanDaySelect,
  });
};

// -------------------------------------------------------
// mark day as Cooking
// -------------------------------------------------------
const markDayCooking = async (id: string, userId: string) => {
  const existing = await prisma.mealPlanDay.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Day not found');
  if (existing.userId !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');

  return prisma.mealPlanDay.update({
    where: { id },
    data: { status: MealPlanDayStatus.Cooking },
    select: mealPlanDaySelect,
  });
};

// -------------------------------------------------------
// mark day as Completed
// -------------------------------------------------------
const markDayCompleted = async (id: string, userId: string) => {
  const existing = await prisma.mealPlanDay.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Day not found');
  if (existing.userId !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');

  // Also mark all meal items as completed
  await prisma.mealPlanDayItem.updateMany({
    where: { planDayId: id, isCompleted: false },
    data: { isCompleted: true, completedAt: new Date() },
  });

  return prisma.mealPlanDay.update({
    where: { id },
    data: { status: MealPlanDayStatus.Completed },
    select: mealPlanDaySelect,
  });
};

// -------------------------------------------------------
// mark day as Skipped
// -------------------------------------------------------
const markDaySkipped = async (id: string, userId: string) => {
  const existing = await prisma.mealPlanDay.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Day not found');
  if (existing.userId !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');

  return prisma.mealPlanDay.update({
    where: { id },
    data: { status: MealPlanDayStatus.Skipped },
    select: mealPlanDaySelect,
  });
};

// -------------------------------------------------------
// assign caregiver to a day
// -------------------------------------------------------
const assignCaregiver = async (req: Request) => {
  const { id } = req.params;
  const { caregiverId } = req.body;

  const existing = await prisma.mealPlanDay.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Day not found');
  if (existing.userId !== req.user.id)
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');

  return prisma.mealPlanDay.update({
    where: { id },
    data: { caregiverId },
    select: mealPlanDaySelect,
  });
};

export const mealPlanDayService = {
  getMealPlanDayById,
  getDaysByWeeklyPlan,
  updateMealPlanDay,
  markDayCooking,
  markDayCompleted,
  markDaySkipped,
  assignCaregiver,
};
