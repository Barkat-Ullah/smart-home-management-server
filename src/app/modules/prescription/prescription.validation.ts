import { z } from 'zod';


const createSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }),
  doctorName: z.string({ required_error: 'doctorName is required', invalid_type_error: 'Invalid doctorName' }).optional(),
  hospitalName: z.string({ required_error: 'hospitalName is required', invalid_type_error: 'Invalid hospitalName' }).optional(),
  notes: z.string({ required_error: 'notes is required', invalid_type_error: 'Invalid notes' }).optional(),
});

const updateSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }).optional(),
  doctorName: z.string({ required_error: 'doctorName is required', invalid_type_error: 'Invalid doctorName' }).optional(),
  hospitalName: z.string({ required_error: 'hospitalName is required', invalid_type_error: 'Invalid hospitalName' }).optional(),
  notes: z.string({ required_error: 'notes is required', invalid_type_error: 'Invalid notes' }).optional(),
});

export const prescriptionValidation = {
  createSchema,
  updateSchema,
};