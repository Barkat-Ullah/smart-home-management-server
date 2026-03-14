import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { mealPlanDayItemSelect } from './mealPlanDayItem.select';

// -------------------------------------------------------
// add a meal item to a day
// -------------------------------------------------------
const addMealItem = async (req: Request) => {
  const userId = req.user.id;
  const { planDayId, mealId, mealTime, customTitle, servings, notes } =
    req.body;

  // Verify the plan day belongs to user
  const planDay = await prisma.mealPlanDay.findUnique({
    where: { id: planDayId },
  });
  if (!planDay) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal plan day not found');
  }
  if (planDay.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // If mealId provided, verify meal exists and belongs to user
  if (mealId) {
    const meal = await prisma.meal.findFirst({
      where: { id: mealId, isDeleted: false },
    });
    if (!meal) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
    }
  }

  const result = await prisma.mealPlanDayItem.create({
    data: {
      planDayId,
      mealId: mealId ?? null,
      mealTime,
      customTitle: customTitle ?? null,
      servings: servings ?? 1,
      notes,
    },
    select: mealPlanDayItemSelect,
  });

  return result;
};

// -------------------------------------------------------
// get a single meal item by id
// -------------------------------------------------------
const getMealItemById = async (id: string) => {
  const result = await prisma.mealPlanDayItem.findUnique({
    where: { id },
    select: mealPlanDayItemSelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal item not found');
  }

  return result;
};

// -------------------------------------------------------
// get all items for a plan day
// -------------------------------------------------------
const getItemsByPlanDay = async (planDayId: string, userId: string) => {
  const planDay = await prisma.mealPlanDay.findUnique({
    where: { id: planDayId },
  });
  if (!planDay) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal plan day not found');
  }
  if (planDay.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return prisma.mealPlanDayItem.findMany({
    where: { planDayId },
    orderBy: { mealTime: 'asc' },
    select: mealPlanDayItemSelect,
  });
};

// -------------------------------------------------------
// update a meal item
// -------------------------------------------------------
const updateMealItem = async (req: Request) => {
  const { id } = req.params;
  const { mealId, mealTime, customTitle, servings, notes } = req.body;

  const existing = await prisma.mealPlanDayItem.findUnique({
    where: { id },
    include: { planDay: { select: { userId: true } } },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal item not found');
  }

  if (existing.planDay.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return prisma.mealPlanDayItem.update({
    where: { id },
    data: { mealId, mealTime, customTitle, servings, notes },
    select: mealPlanDayItemSelect,
  });
};

// -------------------------------------------------------
// mark a single meal item as completed
// -------------------------------------------------------
const completeMealItem = async (id: string, userId: string) => {
  const existing = await prisma.mealPlanDayItem.findUnique({
    where: { id },
    include: { planDay: { select: { userId: true } } },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal item not found');
  }

  if (existing.planDay.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return prisma.mealPlanDayItem.update({
    where: { id },
    data: { isCompleted: true, completedAt: new Date() },
    select: mealPlanDayItemSelect,
  });
};

// -------------------------------------------------------
// delete a meal item
// -------------------------------------------------------
const deleteMealItem = async (id: string, userId: string) => {
  const existing = await prisma.mealPlanDayItem.findUnique({
    where: { id },
    include: { planDay: { select: { userId: true } } },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal item not found');
  }

  if (existing.planDay.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return prisma.mealPlanDayItem.delete({
    where: { id },
    select: { id: true },
  });
};

export const mealPlanDayItemService = {
  addMealItem,
  getMealItemById,
  getItemsByPlanDay,
  updateMealItem,
  completeMealItem,
  deleteMealItem,
};
