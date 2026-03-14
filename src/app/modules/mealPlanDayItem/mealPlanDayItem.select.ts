import { Prisma } from '@prisma/client';

export const mealPlanDayItemSelect = {
  id: true,
  planDayId: true,
  mealId: true,
  mealTime: true,
  customTitle: true,
  servings: true,
  isCompleted: true,
  completedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  meal: {
    select: {
      id: true,
      title: true,
      description: true,
      prepMinutes: true,
      ingredients: true,
      files: true,
    },
  },
} satisfies Prisma.MealPlanDayItemSelect;
