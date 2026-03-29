import { Prisma } from '@prisma/client';

export const houseroomSelect = {
  id: true,
  userId: true,
  name: true,
  type: true,
  files: true,
  isDefault: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  // cameras: { select: { id: true, name: true, status: true } },       // ← uncomment to include
  // aircons: { select: { id: true, name: true, isOn: true } },          // ← uncomment to include
  // smartDevices: { select: { id: true, name: true, type: true } },     // ← uncomment to include
} satisfies Prisma.HouseroomSelect;
