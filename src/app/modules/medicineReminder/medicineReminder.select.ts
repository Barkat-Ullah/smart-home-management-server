import { Prisma } from '@prisma/client';

export const reminderSelect = {
  id: true,
  scheduleId: true,
  userId: true,
  remindAt: true,
  status: true,
  channel: true,
  sentAt: true,
  failReason: true,
  createdAt: true,
  schedule: {
    select: {
      medicineName: true,
      doseAmount: true,
      doseUnit: true,
      scheduledTimes: true,
      medicineForm: true,
    },
  },
} satisfies Prisma.MedicineReminderSelect;
