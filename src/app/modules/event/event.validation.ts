import { z } from 'zod';
import {
  EventCategory,
  EventPriority,
  EventStatus,
  EventType,
} from '@prisma/client';

const createSchema = z.object({

    title: z.string({ required_error: 'Title is required' }).min(1).max(255),
    description: z.string().optional(),
    location: z.string().optional(),
    meetingLink: z
      .string()
      .url('Invalid meeting link URL')
      .optional()
      .or(z.literal('')),
    category: z.nativeEnum(EventCategory, {
      required_error: 'Category is required',
    }),
    type: z.nativeEnum(EventType, { required_error: 'Type is required' }),
    priority: z.nativeEnum(EventPriority).default('Medium'),
    status: z.nativeEnum(EventStatus).default('Upcoming'),
    eventDate: z
      .string({ required_error: 'Event date is required' })
      .refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      }),
    eventTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format')
      .optional(),
    reminderMinutes: z
      .union([z.string(), z.number()])
      .transform(val => (typeof val === 'string' ? parseInt(val, 10) : val))
      .refine(val => !isNaN(val) && val > 0, {
        message: 'Reminder minutes must be a positive number',
      })
      .optional(),
    notes: z.string().optional(),
});

const updateSchema = z.object({

    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    meetingLink: z
      .string()
      .url('Invalid meeting link URL')
      .optional()
      .or(z.literal('')),
    category: z.nativeEnum(EventCategory).optional(),
    type: z.nativeEnum(EventType).optional(),
    priority: z.nativeEnum(EventPriority).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    eventDate: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    eventTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format')
      .optional(),
    reminderMinutes: z
      .union([z.string(), z.number()])
      .transform(val => (typeof val === 'string' ? parseInt(val, 10) : val))
      .refine(val => !isNaN(val) && val > 0, {
        message: 'Reminder minutes must be a positive number',
      })
      .optional(),
    isReminderSent: z.boolean().optional(),
    notes: z.string().optional(),
    isDeleted: z.boolean().optional(),
    completedAt: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
      .optional(),
    cancelledAt: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
      .optional(),
});

export const eventValidation = {
  createSchema,
  updateSchema,
};
