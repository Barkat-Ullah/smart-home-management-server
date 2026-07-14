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
  // receiver: { select: { id: true } }, // ← NEW relation — uncomment to include
  // sender: { select: { id: true } }, // ← NEW relation — uncomment to include
  // followers: { select: { id: true } }, // ← NEW relation — uncomment to include
  // following: { select: { id: true } }, // ← NEW relation — uncomment to include
  // roomSender: { select: { id: true } }, // ← NEW relation — uncomment to include
  // roomReceiver: { select: { id: true } }, // ← NEW relation — uncomment to include
  // sentChats: { select: { id: true } }, // ← NEW relation — uncomment to include
  // receivedChats: { select: { id: true } }, // ← NEW relation — uncomment to include
  // financialProfiles: { select: { id: true } }, // ← NEW relation — uncomment to include
  // transactions: { select: { id: true } }, // ← NEW relation — uncomment to include
  // budgets: { select: { id: true } }, // ← NEW relation — uncomment to include
  // financialGoals: { select: { id: true } }, // ← NEW relation — uncomment to include
  // financialSnapshots: { select: { id: true } }, // ← NEW relation — uncomment to include
  // memories: { select: { id: true } }, // ← NEW relation — uncomment to include
  // memoryShares: { select: { id: true } }, // ← NEW relation — uncomment to include
  // feeds: { select: { id: true } }, // ← NEW relation — uncomment to include
  // feedComments: { select: { id: true } }, // ← NEW relation — uncomment to include
  // feedReactions: { select: { id: true } }, // ← NEW relation — uncomment to include
  // feedStatusChanges: { select: { id: true } }, // ← NEW relation — uncomment to include
  // moderatorAssignments: { select: { id: true } }, // ← NEW relation — uncomment to include
  // adminAssignments: { select: { id: true } }, // ← NEW relation — uncomment to include
  // prescriptions: { select: { id: true } }, // ← NEW relation — uncomment to include
  // medicineSchedules: { select: { id: true } }, // ← NEW relation — uncomment to include
  // doseLogs: { select: { id: true } }, // ← NEW relation — uncomment to include
  // medicineReminders: { select: { id: true } }, // ← NEW relation — uncomment to include
  // meals: { select: { id: true } }, // ← NEW relation — uncomment to include
  // weeklyMealPlans: { select: { id: true } }, // ← NEW relation — uncomment to include
  // mealPlanDays: { select: { id: true } }, // ← NEW relation — uncomment to include
  // caregiverMealDays: { select: { id: true } }, // ← NEW relation — uncomment to include
  // inventories: { select: { id: true } }, // ← NEW relation — uncomment to include
  // events: { select: { id: true } }, // ← NEW relation — uncomment to include
  // houserooms: { select: { id: true } }, // ← NEW relation — uncomment to include
  // cameras: { select: { id: true } }, // ← NEW relation — uncomment to include
  // aircons: { select: { id: true } }, // ← NEW relation — uncomment to include
  // devices: { select: { id: true } }, // ← NEW relation — uncomment to include
  // userSubscriptions: { select: { id: true } }, // ← NEW relation — uncomment to include
} satisfies Prisma.UserSelect;

/**
 * Lightweight select for list views — excludes sensitive/large fields
 */
export const userListSelect = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  role: true,
  status: true,
  image: true,
  plan: true,
  isEmailVerified: true,
  isDeleted: true,
  isOnline: true,
  createdAt: true,
} satisfies Prisma.UserSelect;