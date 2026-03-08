import { z } from 'zod';
import { FeedType, FeedStatus, FeedPriority } from '@prisma/client';

const createSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  type: z.nativeEnum(FeedType).optional(),
  priority: z.nativeEnum(FeedPriority).optional(),
  tags: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(FeedType).optional(),
  priority: z.nativeEnum(FeedPriority).optional(),
  tags: z.array(z.string()).optional(),
});

const changeStatusSchema = z.object({
  status: z.nativeEnum(FeedStatus, { required_error: 'Status is required' }),
  note: z.string().optional(),
});

const assignSchema = z.object({
  moderatorId: z.string({ required_error: 'Moderator ID is required' }),
  note: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string({ required_error: 'Content is required' }),
  parentId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const updateCommentSchema = z.object({
  content: z.string({ required_error: 'Content is required' }),
});

export const feedValidation = {
  createSchema,
  updateSchema,
  changeStatusSchema,
  assignSchema,
  commentSchema,
  updateCommentSchema,
};
