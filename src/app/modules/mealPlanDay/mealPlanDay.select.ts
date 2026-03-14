import { Prisma } from '@prisma/client';

export const mealPlanDaySelect = {
  id: true,
  weeklyPlanId: true,
  userId: true,
  caregiverId: true,
  day: true,
  date: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  mealItems: {
    select: {
      id: true,
      mealTime: true,
      customTitle: true,
      servings: true,
      isCompleted: true,
      completedAt: true,
      notes: true,
      meal: {
        select: {
          id: true,
          title: true,
          prepMinutes: true,
          ingredients: true,
          files: true,
        },
      },
    },
  },
} satisfies Prisma.MealPlanDaySelect;
