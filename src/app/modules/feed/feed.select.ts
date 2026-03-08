import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
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
  files: true, // ← NEW
  createdBy: { select: { id: true, fullName: true, email: true, image: true } }, // ← uncomment to include relation
  // assignments: { select: { id: true } }, // ← uncomment to include relation
  // comments: { select: { id: true } }, // ← uncomment to include relation
  // reactions: { select: { id: true } }, // ← uncomment to include relation
  // statusHistory: { select: { id: true } }, // ← uncomment to include relation
} satisfies Prisma.FeedSelect;
