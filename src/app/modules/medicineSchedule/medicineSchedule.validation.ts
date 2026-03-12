import { z } from 'zod';
import { FrequencyType, MealTiming, MedicineForm } from '@prisma/client';

const createSchema = z.object({
  prescriptionId: z.string({ required_error: 'Prescription ID is required' }),
  medicineName: z.string({ required_error: 'Medicine name is required' }),
  medicineForm: z.nativeEnum(MedicineForm).default(MedicineForm.Tablet),
  doseAmount: z.number({ required_error: 'Dose amount is required' }),
  doseUnit: z.string({ required_error: 'Dose unit is required' }),
  frequencyType: z.nativeEnum(FrequencyType).default(FrequencyType.Daily),
  frequencyValue: z.number().default(1),
  timesPerDay: z.number().optional(),
  specificDays: z.array(z.string()).optional().default([]),
  specificDates: z.array(z.number()).optional().default([]),
  mealTiming: z.nativeEnum(MealTiming).default(MealTiming.AfterMeal),
  scheduledTimes: z
    .array(z.string())
    .min(1, 'At least one scheduled time is required'),
  startDate: z.string({ required_error: 'Start date is required' }),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  sideEffects: z.string().optional(),
  refillReminder: z.boolean().default(false),
  refillAt: z.number().optional(),
});

const updateSchema = z.object({
  medicineName: z.string().optional(),
  medicineForm: z.nativeEnum(MedicineForm).optional(),
  doseAmount: z.number().optional(),
  doseUnit: z.string().optional(),
  frequencyType: z.nativeEnum(FrequencyType).optional(),
  frequencyValue: z.number().optional(),
  timesPerDay: z.number().optional(),
  specificDays: z.array(z.string()).optional(),
  specificDates: z.array(z.number()).optional(),
  mealTiming: z.nativeEnum(MealTiming).optional(),
  scheduledTimes: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  sideEffects: z.string().optional(),
  refillReminder: z.boolean().optional(),
  refillAt: z.number().optional(),
});

export const medicineScheduleValidation = { createSchema, updateSchema };
