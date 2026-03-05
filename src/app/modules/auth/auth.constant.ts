import { houseroomType } from '@prisma/client';

export const defaultRooms: {
  name: string;
  type: houseroomType;
  isDefault: boolean;
}[] = [
  { name: 'Living Room', type: houseroomType.LivingRoom, isDefault: true },
  { name: 'Kitchen', type: houseroomType.Kitchen, isDefault: true },
  { name: 'Bathroom', type: houseroomType.Bathroom, isDefault: true },
  { name: 'Bedroom', type: houseroomType.Bedroom, isDefault: true },
  { name: 'Backyard', type: houseroomType.Backyard, isDefault: true },
  { name: 'Terrace', type: houseroomType.Terrace, isDefault: true },
];
