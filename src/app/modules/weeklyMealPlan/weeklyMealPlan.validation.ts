import { z } from 'zod';
import { WeeklyPlanStatus } from '@prisma/client';

const createSchema = z.object({
  startDate: z.string({ required_error: 'Start date (Monday) is required' }),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  notes: z.string().optional(),
  status: z.nativeEnum(WeeklyPlanStatus).optional(),
});

export const weeklyMealPlanValidation = { createSchema, updateSchema };
