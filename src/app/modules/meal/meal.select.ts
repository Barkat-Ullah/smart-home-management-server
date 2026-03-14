import { Prisma } from '@prisma/client';

export const mealSelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  ingredients: true,
  files: true,
  prepMinutes: true,
  createdAt: true,
  updatedAt: true,
  // Uncomment to include how many times this meal has been used in plans
  // mealPlanDayItems: { select: { id: true } },
} satisfies Prisma.MealSelect;
