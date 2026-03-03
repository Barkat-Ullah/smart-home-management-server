import { z } from 'zod';
import { Prisma, DurationType } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }),
  amount: z.number({ required_error: 'amount is required', invalid_type_error: 'Invalid amount' }).int('Must be an integer'),
  features: z.array(z.string({ required_error: 'Features is required', invalid_type_error: 'Invalid Features' }), { required_error: 'Features is required', invalid_type_error: 'Invalid Features' }),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

const updateSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }).optional(),
  amount: z.number({ required_error: 'amount is required', invalid_type_error: 'Invalid amount' }).optional(),
  features: z.array(z.string({ required_error: 'Features is required', invalid_type_error: 'Invalid Features' }), { required_error: 'Features is required', invalid_type_error: 'Invalid Features' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

export const subscriptionValidation = {
  createSchema,
  updateSchema,
};