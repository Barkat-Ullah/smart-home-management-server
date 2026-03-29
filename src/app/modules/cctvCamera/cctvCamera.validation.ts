import { z } from 'zod';
import { DeviceStatus } from '@prisma/client';

const createSchema = z.object({
  houseroomId: z.string({
    required_error: 'houseroomId is required',
    invalid_type_error: 'Invalid houseroomId',
  }),
  name: z.string({
    required_error: 'Camera name is required',
    invalid_type_error: 'Invalid camera name',
  }),
  streamUrl: z.string({
    required_error: 'Stream URL is required',
    invalid_type_error: 'Invalid stream URL',
  }),
  username: z.string().optional(),
  password: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
});

const updateSchema = z.object({
  houseroomId: z.string().optional(),
  name: z.string().optional(),
  streamUrl: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  status: z
    .nativeEnum(DeviceStatus, { invalid_type_error: 'Invalid status' })
    .optional(),
});

export const cctvCameraValidation = {
  createSchema,
  updateSchema,
};
