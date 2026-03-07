import { z } from 'zod';
import { Location, InventoryCategory } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }),
  location: z.nativeEnum(Location, { required_error: 'location is required', invalid_type_error: 'Invalid location' }),
  item: z.number({ required_error: 'item is required', invalid_type_error: 'Invalid item' }).int('Must be an integer').optional(),
  category: z.nativeEnum(InventoryCategory, { required_error: 'category is required', invalid_type_error: 'Invalid category' }),
});

const updateSchema = z.object({

  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }).optional(),
  location: z.nativeEnum(Location, { required_error: 'location is required', invalid_type_error: 'Invalid location' }).optional(),
  item: z.number({ required_error: 'item is required', invalid_type_error: 'Invalid item' }).int('Must be an integer').optional(),
  category: z.nativeEnum(InventoryCategory, { required_error: 'category is required', invalid_type_error: 'Invalid category' }).optional(),

});

export const inventoryValidation = {
  createSchema,
  updateSchema,
};