import { z } from 'zod';
import { houseroomType } from '@prisma/client';

const createSchema = z.object({
  name: z.string({
    required_error: 'Room name is required',
    invalid_type_error: 'Invalid room name',
  }),
  type: z.nativeEnum(houseroomType, {
    required_error: 'Room type is required',
    invalid_type_error: 'Invalid room type',
  }),
});

const updateSchema = z.object({
  name: z.string({ invalid_type_error: 'Invalid room name' }).optional(),
  type: z
    .nativeEnum(houseroomType, { invalid_type_error: 'Invalid room type' })
    .optional(),
});

export const houseroomValidation = {
  createSchema,
  updateSchema,
};
