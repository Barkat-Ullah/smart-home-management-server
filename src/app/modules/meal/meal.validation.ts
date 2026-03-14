import { z } from 'zod';

const createSchema = z.object({
  title: z.string({
    required_error: 'title is required',
    invalid_type_error: 'Invalid title',
  }),
  description: z
    .string({
      required_error: 'description is required',
      invalid_type_error: 'Invalid description',
    })
    .optional(),
  ingredients: z.array(
    z.string({
      required_error: 'ingredients is required',
      invalid_type_error: 'Invalid ingredients',
    }),
    {
      required_error: 'ingredients is required',
      invalid_type_error: 'Invalid ingredients',
    },
  ),
  prepMinutes: z
    .number({
      required_error: 'prepMinutes is required',
      invalid_type_error: 'Invalid prepMinutes',
    })
    .int('Must be an integer')
    .optional(),
});

const updateSchema = z.object({
  title: z
    .string({
      required_error: 'title is required',
      invalid_type_error: 'Invalid title',
    })
    .optional(),
  description: z
    .string({
      required_error: 'description is required',
      invalid_type_error: 'Invalid description',
    })
    .optional(),
  ingredients: z
    .array(
      z.string({
        required_error: 'ingredients is required',
        invalid_type_error: 'Invalid ingredients',
      }),
      {
        required_error: 'ingredients is required',
        invalid_type_error: 'Invalid ingredients',
      },
    )
    .optional(),
  prepMinutes: z
    .number({
      required_error: 'prepMinutes is required',
      invalid_type_error: 'Invalid prepMinutes',
    })
    .int('Must be an integer')
    .optional(),
});

export const mealValidation = {
  createSchema,
  updateSchema,
};
