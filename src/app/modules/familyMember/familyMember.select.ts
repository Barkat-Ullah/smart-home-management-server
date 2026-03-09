import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const familyMemberSelect = {
  id: true,
  fullName: true,
  relation: true,
  gender: true,
  dateOfBirth: true,
  occupation: true,
  phone: true,
  email: true,
  files: true,
  address: true,
  city: true,
  country: true,
  about: true,
  status: true,
  createdAt: true,
  isDeleted:true,
  createdBy: { select: { id: true, fullName: true, email: true, image: true } },
  // memories: { select: { id: true } }, // ← uncomment to include relation
} satisfies Prisma.FamilyMemberSelect;
