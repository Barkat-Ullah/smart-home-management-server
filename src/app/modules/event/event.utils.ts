import { Prisma } from '@prisma/client';

export const buildFilterConditions = (
  filterData: Record<string, any>,
): Prisma.EventWhereInput[] => {
  const conditions: Prisma.EventWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    // ── Date range filters ──────────────────────────────────
    if (key === 'createdAt' || key === 'eventDate') {
      const parts = (value as string).split('-');
      if (parts.length === 2 && key === 'createdAt') {
        // Format: "YYYY-MM" → full month range
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        conditions.push({
          createdAt: { gte: start, lte: end },
        });
      } else {
        // Format: "YYYY-MM-DD" → single day
        const start = new Date(value);
        start.setHours(0, 0, 0, 0);
        const end = new Date(value);
        end.setHours(23, 59, 59, 999);
        conditions.push({
          [key]: { gte: start, lte: end },
        });
      }
      return;
    }

    // ── Enum / multi-value filters ─────────────────────────
    if (['status', 'category', 'type', 'priority'].includes(key)) {
      conditions.push({
        [key]: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    // ── Relation dot-notation (e.g. "createdBy.fullName") ──
    if (key.includes('.')) {
      const [relation, field] = key.split('.');
      conditions.push({ [relation]: { [field]: value } });
      return;
    }

    // ── Direct scalar field match ───────────────────────────
    conditions.push({ [key]: value });
  });

  return conditions;
};
