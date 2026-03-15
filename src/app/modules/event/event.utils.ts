import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// Helper: UTC date
// ─────────────────────────────────────────────
export const toUTCStartOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

export const toUTCEndOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
};

export const toUTCStartOfMonth = (year: number, month: number): Date => {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
};

export const toUTCEndOfMonth = (year: number, month: number): Date => {
  return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
};

// ─────────────────────────────────────────────
// Main filter builder
// ─────────────────────────────────────────────
export const buildFilterConditions = (
  filterData: Record<string, any>,
): Prisma.EventWhereInput[] => {
  const conditions: Prisma.EventWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    // ── Date range filters ─────────────────────────────────
    if (key === 'createdAt' || key === 'eventDate') {
      const parts = (value as string).split('-');

      if (parts.length === 2) {
        // Format: "YYYY-MM" →
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        conditions.push({
          [key]: {
            gte: toUTCStartOfMonth(year, month),
            lte: toUTCEndOfMonth(year, month),
          },
        });
      } else if (parts.length === 3) {
        // Format: "YYYY-MM-DD" →
        conditions.push({
          [key]: {
            gte: toUTCStartOfDay(value),
            lte: toUTCEndOfDay(value),
          },
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

    // ── Relation dot-notation ──────────────────────────────
    if (key.includes('.')) {
      const [relation, field] = key.split('.');
      conditions.push({ [relation]: { [field]: value } });
      return;
    }

    // ── Direct scalar field match ──────────────────────────
    conditions.push({ [key]: value });
  });

  return conditions;
};
