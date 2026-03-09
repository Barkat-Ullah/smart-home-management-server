import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const eventSelect = {
  id: true,
  title: true,
  description: true,
  location: true,
  meetingLink: true,
  category: true,
  type: true,
  priority: true,
  status: true,
  eventDate: true,
  eventTime: true,
  reminderMinutes: true,
  isReminderSent: true,
  files: true,
  notes: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdBy: { select: { id: true, fullName: true, email: true, image: true } },
} satisfies Prisma.EventSelect;
