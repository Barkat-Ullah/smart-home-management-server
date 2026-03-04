import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  password: true,
  role: true,
  status: true,
  describe: true,
  city: true,
  address: true,
  image: true,
  bloodGroup: true,
  gender: true,
  allergies: true,
  isAgreeWithTerms: true,
  plan: true,
  otp: true,
  otpExpiry: true,
  emailVerificationToken: true,
  emailVerificationTokenExpires: true,
  isEmailVerified: true,
  isDeleted: true,
  stripeCustomerId: true,
  fcmToken: true,
  isOnline: true,
  clientInfo: true,
  ipInfo: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  // createdBy: { select: { id: true } }, // ← uncomment to include relation
  // createdUsers: { select: { id: true } }, // ← uncomment to include relation
  // children: { select: { id: true } }, // ← uncomment to include relation
  // familyMembers: { select: { id: true } }, // ← uncomment to include relation
  // logouts: { select: { id: true } }, // ← uncomment to include relation
  // activities: { select: { id: true } }, // ← uncomment to include relation
  // favorites: { select: { id: true } }, // ← uncomment to include relation
  // payments: { select: { id: true } }, // ← uncomment to include relation
} satisfies Prisma.UserSelect;