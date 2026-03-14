import { Prisma } from '@prisma/client';

export const weeklyMealPlanSelect = {
  id: true,
  userId: true,
  weekNumber: true,
  startDate: true,
  endDate: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
} satisfies Prisma.WeeklyMealPlanSelect;

export const weeklyMealPlanWithDaysSelect = {
  id: true,
  userId: true,
  weekNumber: true,
  startDate: true,
  endDate: true,
  status: true,
  notes: true,
  createdAt: true,
  completedAt: true,
  days: {
    orderBy: { date: 'asc' as const },
    select: {
      id: true,
      day: true,
      date: true,
      status: true,
      notes: true,
      caregiverId: true,
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
            },
          },
        },
      },
    },
  },
} satisfies Prisma.WeeklyMealPlanSelect;
