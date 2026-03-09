import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const childSelect = {
  id: true,
  fullName: true,
  preferredName: true,
  dateOfBirth: true,
  gender: true,
  bloodGroup: true,
  favoriteFood: true,
  allergies: true,
  medicalConditions: true,
  heightCm: true,
  weightKg: true,
  lastCheckupDate: true,
  emergencyContact: true,
  medicineRoutine: true,
  files: true,
  about: true,
  schoolName: true,
  classGrade: true,
  interests: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  createdBy: { select: { id: true, fullName: true, email: true, image: true } },
} satisfies Prisma.ChildSelect;
