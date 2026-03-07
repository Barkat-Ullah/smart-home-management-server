import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const inventorySelect = {
  id: true,
  userId: true,
  title: true,
  location: true,
  item: true,
  category: true,
  createdAt: true,
  // user: { select: { id: true } }, // ← uncomment to include relation
  updatedAt: true, // ← NEW
  status: true, // ← NEW
} satisfies Prisma.InventorySelect;