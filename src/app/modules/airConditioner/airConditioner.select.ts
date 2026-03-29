import { Prisma } from '@prisma/client';

export const airConditionerSelect = {
  id: true,
  userId: true,
  houseroomId: true,
  name: true,
  brand: true,
  isOn: true,
  temperature: true,
  humidity: true,
  fanSpeed: true,
  mode: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  // houseroom: { select: { id: true, name: true, type: true } }, // ← uncomment to include
} satisfies Prisma.AirConditionerSelect;
