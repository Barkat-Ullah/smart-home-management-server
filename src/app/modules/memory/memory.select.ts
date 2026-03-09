import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const memorySelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  files: true,
  memoryOf: true,
  relatedPersonId: true,
  createdAt: true,
  updatedAt: true,
  // sharedWith: { select: { id: true, } }, // ← uncomment to include relation
  createdBy: { select: { id: true, fullName: true, image: true } }, // ← uncomment to include relation
  relatedTo: { select: { id: true, fullName: true, files: true } }, // ← uncomment to include relation
} satisfies Prisma.MemorySelect;
