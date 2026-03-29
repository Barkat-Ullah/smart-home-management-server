import { Prisma } from '@prisma/client';

export const smartDeviceSelect = {
  id: true,
  userId: true,
  houseroomId: true,
  name: true,
  type: true,
  brand: true,
  model: true,
  iconUrl: true,
  isOn: true,
  status: true,
  powerUsage: true,
  activeHours: true,
  controlType: true,
  controlId: true,
  controlMeta: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  lastSeenAt: true,
  // houseroom: { select: { id: true, name: true, type: true } }, // ← uncomment to include
} satisfies Prisma.SmartDeviceSelect;
