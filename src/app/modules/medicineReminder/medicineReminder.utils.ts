import { Prisma } from '@prisma/client';

export const buildReminderFilterConditions = (
  filterData: Record<string, any>,
): Prisma.MedicineReminderWhereInput[] => {
  const conditions: Prisma.MedicineReminderWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'from') {
      conditions.push({ remindAt: { gte: new Date(value) } });
      return;
    }

    if (key === 'to') {
      conditions.push({ remindAt: { lte: new Date(value) } });
      return;
    }

    if (key === 'status') {
      conditions.push({
        status: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};
