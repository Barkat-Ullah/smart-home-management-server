import { z } from 'zod';
import { DeviceType, DeviceStatus } from '@prisma/client';

const createSchema = z.object({
  houseroomId: z.string({
    required_error: 'houseroomId is required',
    invalid_type_error: 'Invalid houseroomId',
  }),
  name: z.string({
    required_error: 'Device name is required',
    invalid_type_error: 'Invalid device name',
  }),
  type: z
    .nativeEnum(DeviceType, { invalid_type_error: 'Invalid device type' })
    .optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  iconUrl: z.string().optional(),
  isOn: z.boolean().optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
  powerUsage: z.number().optional(),
  activeHours: z.number().optional(),
  controlType: z.string().optional(),
  controlId: z.string().optional(),
  controlMeta: z.string().optional(),
});

const updateSchema = z.object({
  houseroomId: z.string().optional(),
  name: z.string().optional(),
  type: z
    .nativeEnum(DeviceType, { invalid_type_error: 'Invalid device type' })
    .optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  iconUrl: z.string().optional(),
  isOn: z.boolean().optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
  powerUsage: z.number().optional(),
  activeHours: z.number().optional(),
  controlType: z.string().optional(),
  controlId: z.string().optional(),
  controlMeta: z.string().optional(),
});

const toggleSchema = z.object({
  isOn: z.boolean({ required_error: 'isOn is required' }),
});

export const smartDeviceValidation = {
  createSchema,
  updateSchema,
  toggleSchema,
};
