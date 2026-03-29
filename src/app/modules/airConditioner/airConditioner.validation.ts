import { z } from 'zod';
import { AcMode, DeviceStatus } from '@prisma/client';

const createSchema = z.object({
  houseroomId: z.string({
    required_error: 'houseroomId is required',
    invalid_type_error: 'Invalid houseroomId',
  }),
  name: z.string({
    required_error: 'AC name is required',
    invalid_type_error: 'Invalid AC name',
  }),
  brand: z.string().optional(),
  isOn: z.boolean().optional(),
  temperature: z
    .number()
    .int()
    .min(16, 'Min temperature is 16°C')
    .max(30, 'Max temperature is 30°C')
    .optional(),
  humidity: z.number().int().min(0).max(100).optional(),
  fanSpeed: z
    .number()
    .int()
    .min(1, 'Min fan speed is 1')
    .max(5, 'Max fan speed is 5')
    .optional(),
  mode: z
    .nativeEnum(AcMode, { invalid_type_error: 'Invalid AC mode' })
    .optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
});

const updateSchema = z.object({
  houseroomId: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  isOn: z.boolean().optional(),
  temperature: z
    .number()
    .int()
    .min(16, 'Min temperature is 16°C')
    .max(30, 'Max temperature is 30°C')
    .optional(),
  humidity: z.number().int().min(0).max(100).optional(),
  fanSpeed: z
    .number()
    .int()
    .min(1, 'Min fan speed is 1')
    .max(5, 'Max fan speed is 5')
    .optional(),
  mode: z
    .nativeEnum(AcMode, { invalid_type_error: 'Invalid AC mode' })
    .optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
});

// Full AC control in one call
const controlSchema = z.object({
  isOn: z.boolean().optional(),
  temperature: z.number().int().min(16).max(30).optional(),
  humidity: z.number().int().min(0).max(100).optional(),
  fanSpeed: z.number().int().min(1).max(5).optional(),
  mode: z.nativeEnum(AcMode).optional(),
});

export const airConditionerValidation = {
  createSchema,
  updateSchema,
  controlSchema,
};
