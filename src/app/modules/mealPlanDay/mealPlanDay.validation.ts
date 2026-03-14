import { z } from 'zod';
import { MealPlanDayStatus } from '@prisma/client';

const updateSchema = z.object({
  body: z.object({
    status: z.nativeEnum(MealPlanDayStatus).optional(),
    notes: z.string().optional(),
    // Assign a caregiver to this day
    caregiverId: z.string().optional(),
  }),
});

export const mealPlanDayValidation = { updateSchema };
