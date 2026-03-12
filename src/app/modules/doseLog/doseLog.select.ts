import { Prisma } from '@prisma/client';

export const doseLogSelect = {
  id: true,
  scheduleId: true,
  userId: true,
  scheduledAt: true,
  takenAt: true,
  status: true,
  skipReason: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  schedule: {
    select: {
      medicineName: true,
      medicineForm: true,
      doseAmount: true,
      doseUnit: true,
    },
  },
} satisfies Prisma.DoseLogSelect;
