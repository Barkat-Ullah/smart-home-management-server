import { z } from 'zod';
import { StageEnum, ActivitiesEnum, ArticleStatus } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }),
  description: z.string({ required_error: 'description is required', invalid_type_error: 'Invalid description' }),
  stage: z.nativeEnum(StageEnum, { required_error: 'stage is required', invalid_type_error: 'Invalid stage' }),
  activity: z.nativeEnum(ActivitiesEnum, { required_error: 'activity is required', invalid_type_error: 'Invalid activity' }),
  skill: z.array(z.string({ required_error: 'skill is required', invalid_type_error: 'Invalid skill' }), { required_error: 'skill is required', invalid_type_error: 'Invalid skill' }),
  image: z.string({ required_error: 'image is required', invalid_type_error: 'Invalid image' }).optional(),
  link: z.string({ required_error: 'link is required', invalid_type_error: 'Invalid link' }).optional(),
  materials: z.string({ required_error: 'materials is required', invalid_type_error: 'Invalid materials' }).optional(),
  howToDoIt: z.string({ required_error: 'howToDoIt is required', invalid_type_error: 'Invalid howToDoIt' }).optional(),
  whatItHelpsWith: z.string({ required_error: 'whatItHelpsWith is required', invalid_type_error: 'Invalid whatItHelpsWith' }).optional(),
  parentNote: z.string({ required_error: 'parentNote is required', invalid_type_error: 'Invalid parentNote' }).optional(),
  isKept: z.boolean({ required_error: 'isKept is required', invalid_type_error: 'Invalid isKept' }).optional(),
  isAutoPush: z.boolean({ required_error: 'isAutoPush is required', invalid_type_error: 'Invalid isAutoPush' }).optional(),
  status: z.nativeEnum(ArticleStatus, { required_error: 'status is required', invalid_type_error: 'Invalid status' }).optional(),
  isSave: z.boolean({ required_error: 'isSave is required', invalid_type_error: 'Invalid isSave' }).optional(),
});

const updateSchema = z.object({

  title: z.string({ required_error: 'title is required', invalid_type_error: 'Invalid title' }).optional(),
  description: z.string({ required_error: 'description is required', invalid_type_error: 'Invalid description' }).optional(),
  stage: z.nativeEnum(StageEnum, { required_error: 'stage is required', invalid_type_error: 'Invalid stage' }).optional(),
  activity: z.nativeEnum(ActivitiesEnum, { required_error: 'activity is required', invalid_type_error: 'Invalid activity' }).optional(),
  skill: z.array(z.string({ required_error: 'skill is required', invalid_type_error: 'Invalid skill' }), { required_error: 'skill is required', invalid_type_error: 'Invalid skill' }).optional(),
  image: z.string({ required_error: 'image is required', invalid_type_error: 'Invalid image' }).optional(),
  link: z.string({ required_error: 'link is required', invalid_type_error: 'Invalid link' }).optional(),
  materials: z.string({ required_error: 'materials is required', invalid_type_error: 'Invalid materials' }).optional(),
  howToDoIt: z.string({ required_error: 'howToDoIt is required', invalid_type_error: 'Invalid howToDoIt' }).optional(),
  whatItHelpsWith: z.string({ required_error: 'whatItHelpsWith is required', invalid_type_error: 'Invalid whatItHelpsWith' }).optional(),
  parentNote: z.string({ required_error: 'parentNote is required', invalid_type_error: 'Invalid parentNote' }).optional(),
  isKept: z.boolean({ required_error: 'isKept is required', invalid_type_error: 'Invalid isKept' }).optional(),
  isAutoPush: z.boolean({ required_error: 'isAutoPush is required', invalid_type_error: 'Invalid isAutoPush' }).optional(),
  status: z.nativeEnum(ArticleStatus, { required_error: 'status is required', invalid_type_error: 'Invalid status' }).optional(),
  isSave: z.boolean({ required_error: 'isSave is required', invalid_type_error: 'Invalid isSave' }).optional(),
});

export const articleValidation = {
  createSchema,
  updateSchema,
};