import { Prisma } from '@prisma/client';

export const feedSelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  type: true,
  status: true,
  priority: true,
  tags: true,
  isDeleted: true,
  isPinned: true,
  isLocked: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  closedAt: true,
  files: true,
  _count: {
    select: {
      reactions: true,
      comments: true,
    },
  },
  createdBy: {
    select: { id: true, fullName: true, email: true, image: true },
  },
  reactions: {
    select: {
      id: true,
      isFavorite: true,
      user: {
        select: { id: true, fullName: true, image: true },
      },
    },
  },
  comments: {
    where: { isDeleted: false, parentId: null },
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      content: true,
      isEdited: true,
      isSolution: true,
      attachments: true,
      createdAt: true,
      author: {
        select: { id: true, fullName: true, image: true },
      },
      replies: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'asc' as const },
        select: {
          id: true,
          content: true,
          isEdited: true,
          attachments: true,
          createdAt: true,
          author: {
            select: { id: true, fullName: true, email: true, image: true },
          },
        },
      },
    },
  },
  assignments: {
    where: { isActive: true },
    select: {
      id: true,
      note: true,
      assignedAt: true,
      isActive: true,
      moderator: {
        select: { id: true, fullName: true, email: true, image: true },
      },
      assignedByUser: {
        select: { id: true, fullName: true },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
      changedByUser: {
        select: { id: true, fullName: true, image: true },
      },
    },
  },
} satisfies Prisma.FeedSelect;
