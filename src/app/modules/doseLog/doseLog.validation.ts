import { z } from 'zod';
import { DoseLogStatus } from '@prisma/client';

const createSchema = z.object({
  scheduleId: z.string({ required_error: 'Schedule ID is required' }),
  scheduledAt: z.string({ required_error: 'Scheduled time is required' }),
  takenAt: z.string().optional(),
  status: z.nativeEnum(DoseLogStatus, {
    required_error: 'Status is required',
  }),
  skipReason: z.string().optional(),
  note: z.string().optional(),
});

export const doseLogValidation = { createSchema };
