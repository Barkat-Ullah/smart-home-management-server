import { Prisma } from '@prisma/client';

export const cctvCameraSelect = {
  id: true,
  userId: true,
  houseroomId: true,
  name: true,
  streamUrl: true,
  username: true,
  // password: false, // ⚠️ NEVER expose password in responses
  brand: true,
  model: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  // houseroom: { select: { id: true, name: true, type: true } }, // ← uncomment to include
} satisfies Prisma.CctvCameraSelect;
