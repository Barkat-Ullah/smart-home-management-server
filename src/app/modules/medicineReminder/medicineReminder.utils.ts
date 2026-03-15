import { Prisma } from '@prisma/client';
import { toUTCEndOfDay, toUTCStartOfDay } from '../event/event.utils';

export const buildReminderFilterConditions = (
  filterData: Record<string, any>,
): Prisma.MedicineReminderWhereInput[] => {
  const conditions: Prisma.MedicineReminderWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'from') {
      conditions.push({ remindAt: { gte: toUTCStartOfDay(value) } });
      return;
    }

    if (key === 'to') {
      conditions.push({ remindAt: { lte: toUTCEndOfDay(value) } });
      return;
    }

    // ── Enum filter ────────────────────────────────────────
    if (key === 'status') {
      conditions.push({
        status: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    // ── Direct match ───────────────────────────────────────
    conditions.push({ [key]: value });
  });

  return conditions;
};
