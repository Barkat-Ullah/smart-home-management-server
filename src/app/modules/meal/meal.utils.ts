import { Prisma } from '@prisma/client';
import { toUTCEndOfDay, toUTCEndOfMonth, toUTCStartOfDay, toUTCStartOfMonth } from '../event/event.utils';

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
        // Format: "YYYY-MM" →
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        conditions.push({
          createdAt: {
            gte: toUTCStartOfMonth(year, month),
            lte: toUTCEndOfMonth(year, month),
          },
        });
      } else if (parts.length === 3) {
        // Format: "YYYY-MM-DD" →
        conditions.push({
          createdAt: {
            gte: toUTCStartOfDay(value),
            lte: toUTCEndOfDay(value),
          },
        });
      }
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};
