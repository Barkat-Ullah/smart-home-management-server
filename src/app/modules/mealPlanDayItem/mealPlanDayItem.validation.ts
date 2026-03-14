import { z } from 'zod';
import { MealTime } from '@prisma/client';

const createSchema = z.object({
  body: z
    .object({
      planDayId: z.string({ required_error: 'Plan day ID is required' }),
      mealTime: z.nativeEnum(MealTime, {
        required_error: 'Meal time is required',
      }),
      // Either mealId (from saved Meal) OR customTitle (quick entry)
      mealId: z.string().optional(),
      customTitle: z.string().optional(),
      servings: z.number().default(1),
      notes: z.string().optional(),
    })
    .refine(data => data.mealId || data.customTitle, {
      message: 'Either mealId or customTitle is required',
    }),
});

const updateSchema = z.object({
  body: z.object({
    mealTime: z.nativeEnum(MealTime).optional(),
    mealId: z.string().optional(),
    customTitle: z.string().optional(),
    servings: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const mealPlanDayItemValidation = { createSchema, updateSchema };
