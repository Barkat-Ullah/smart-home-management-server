import { z } from 'zod';
import { MemoryOf } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }),
  description: z.string({ required_error: 'description is required', invalid_type_error: 'Invalid description' }),
  memoryOf: z.nativeEnum(MemoryOf, { required_error: 'memoryOf is required', invalid_type_error: 'Invalid memoryOf' }).optional(),
  relatedPersonId: z.string({ required_error: 'relatedPersonId is required', invalid_type_error: 'Invalid relatedPersonId' }).optional(),
});

const updateSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }).optional(),
  description: z.string({ required_error: 'description is required', invalid_type_error: 'Invalid description' }).optional(),
  memoryOf: z.nativeEnum(MemoryOf, { required_error: 'memoryOf is required', invalid_type_error: 'Invalid memoryOf' }).optional(),
  relatedPersonId: z.string({ required_error: 'relatedPersonId is required', invalid_type_error: 'Invalid relatedPersonId' }).optional(),
});

export const memoryValidation = {
  createSchema,
  updateSchema,
};