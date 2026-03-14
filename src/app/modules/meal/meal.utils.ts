import { Prisma } from '@prisma/client';

export const buildMealFilterConditions = (
  filterData: Record<string, any>,
): Prisma.MealWhereInput[] => {
  const conditions: Prisma.MealWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'createdAt') {
      const parts = (value as string).split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        conditions.push({
          createdAt: { gte: start.toISOString(), lte: end.toISOString() },
        });
      } else {
        const start = new Date(value);
        start.setHours(0, 0, 0, 0);
        const end = new Date(value);
        end.setHours(23, 59, 59, 999);
        conditions.push({
          createdAt: { gte: start.toISOString(), lte: end.toISOString() },
        });
      }
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};
